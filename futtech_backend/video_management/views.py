#!/usr/bin/env python3
"""
API views for video upload, metadata and private Bunny playback.
"""

import json
import subprocess

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden, JsonResponse

from djstripe.models import Customer
from djstripe.settings import djstripe_settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

import stripe # Was pip installed with 'djstripe'

from . import services
from .logs import logger
from .models import PlaybackHistory, Video
from .serializers import PlaybackHistorySerializer, VideoSerializer

stripe.api_key = djstripe_settings.STRIPE_SECRET_KEY

MAX_VIDEO_DURATION_SECONDS = 300
MAX_VIDEO_SIZE_BYTES = 250 * 1024 * 1024

def _check_video_duration(uploaded_file):
    """
    Try ffprobe for duration; fallback to file-size hard limit.
    """
    if uploaded_file.size >  MAX_VIDEO_SIZE_BYTES:
        return False, "Video file is too large for the 5-minute upload policy."

    try:
        probe = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                uploaded_file.temporary_file_path(),
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        duration = float((probe.stdout or "0").strip())
        if duration > MAX_VIDEO_DURATION_SECONDS:
            return False, "Video duration exceeds 5 minutes."
    except Exception:
        logger.warning("ffprobe unavailable; duration check fell back to siwe-only validation.")

    return True, None

def _can_access_video(user, video):
    if video.owner_id == user.id:
        return True
    if not video.is_premium:
        return True
    return user.profile.has_active_subscription()

@login_required
def get_video_playback(request, video_id):
    try:
        video = Video.objects.get(pk=video_id)
    except Video.DoesNotExist:
        return JsonResponse({"error": "Video not found"}, status=404)

    if not _can_access_video(request.user, video):
        return HttpResponseForbidden("You do not have permission to view this video.")

    if not video.video_library_id or not video.bunny_video_id:
        return JsonResponse({"error": "Video is not linked to Bunny Stream"}, status=400)

    if video.status != "ready":
        try:
            services.refresh_video_status(video)
        except Exception as err:
            logger.error("Could not sync Bunny status for %s: %s", video.id, err)

    embed_url = services.build_embed_url(video.video_library_id, video.bunny_video_id)
    return JsonResponse({"embed_url": embed_url, "status": video.status})

@login_required
def get_video_data(request, video_id):
    try:
        video = Video.objects.get(pk=video_id)
    except Video.DoesNotExist:
        return JsonResponse({'error': 'Video not found'}, status=404)

    if not _can_access_video(request.user, video):
        return HttpResponseForbidden("You do not have permission to view this video.")

    return JsonResponse(VideoSerializer(video).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_featured_videos(request):
    """
    Returns a limited list of the public videos for the authenticated user.

    Params:
    	request - The HTTP request containing the optional query parameter 'limit'.

    Return:
    	A DRF Response object containing serialized video data.
    """

    try:
        limit = int(request.query_params.get('limit', 20))
    except (TypeError, ValueError):
        limit = 20

    # Keep limits sane and non-negative to avoid unexpected query slices.
    limit = max(1, min(limit, 50))

    videos = Video.objects.filter(is_premium='false', status='ready').order_by('-created_at')[:limit]
    return Response(VideoSerializer(videos, many=True).data)


@login_required
def get_pricing_page_identifiers(request):
    """
    Provides the key-ID pair required for usage of
    Stripe's embeddable pricing table.

    Params:
    	request - Dictionary object containing client-side data needed to
    		  effectively respond to the user's request.

    Return:
    	A JSON object bundling together all necessary identifiers.
    """

    return JsonResponse({
        'stripe_public_key': djstripe_settings.STRIPE_PUBLIC_KEY,
        'stripe_pricing_table_id': settings.STRIPE_PRICING_TABLE_ID
    })


@login_required
def get_subscription_confirmation(request):
    """
    Provisions a user with the newly paid-for-subscription.

    Params:
    	request - The object representation of the frontend request.

    Return:
    	A redirect to Stripe's customer portal for subscription management.
    """

    # Extract the session ID from the URL & fetch its associated Stripe session
    session_id = request.GET.get('session_id')
    if not session_id:
        return JsonResponse({'error': 'Missing session identifier'}, status=400)

    session = stripe.checkout.Session.retrieve(session_id)
    user = request.user
    customer_id = session.get('customer')

    # Ensure match between he who initiated the session and a user in our DB
    if customer_id:
        customer = Customer.objects.filter(id=customer_id).first()
        if customer and hasattr(user, 'profile'):
            user.profile.customer = customer
            user.profile.save(update_fields=['customer'])

    return JsonResponse({'status': 'ok'})


@login_required
def create_portal_session(request):
    profile = request.user.profile
    if not profile.customer:
        return JsonResponse({'error': 'No billing customer found'}, status=404)

    session = stripe.billing_portal.Session.create(
        customer=profile.customer.id,
        return_url=request.build_absolute_uri('/pricing-page'),
    )
    return JsonResponse({'url': session.url})


class PlaybackHistoryView(APIView):
    """
    Handles POST or PATCH request to update video watch progress.

    Inheritance:
    	APIView - Empowers this view with a set of predefined class attributes
    		  from the 'Base of all views in REST Framework'.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = PlaybackHistorySerializer(data=request.data)
        if serializer.is_valid():
            video = serializer.validated_data['video']
            progress = serializer.validated_data['watch_progress']

            PlaybackHistory.objects.update_or_create(
                user=request.user,
                video=video,
                defaults={'watch_progress': progress}
            )
            return Response({'status': 'success'}, status=200)

        return Response(serializer.errors, status=400)


class VideoUploadView(APIView):
    """
    Handles on-demand provision of MUX direct upload URLs to the frontend.

    Inheritance:
    	APIView - Empowers this view with a set of predefined class attributes
    		  from the 'Base of all views in Django REST Framework'.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'file is required'}, status=400)

        is_valid, error = _check_video_duration(uploaded_file)
        if not is_valid:
            return Response({'error': error}, status=400)

        title = request.data.get('title', '').strip()
        if not title:
            return Response({'error': 'title is required'}, status=400)

        description = request.data.get('description', '')

        try:
            bunny_video = services.create_video_entry(title=title)
            uploaded_file.seek(0)
            services.upload_video_file(bunny_video['guid'], uploaded_file)

            video = Video.objects.create(
                owner=request.user,
                title=title,
                description=description,
                is_premium=str(request.data.get('is_premium', 'false')).lower() == 'true',
                is_drone=str(request.data.get('is_drone', 'false')).lower() == 'true',
                is_analysis=str(request.data.get('is_analysis', 'false')).lower() == 'true',
                bunny_video_id=bunny_video['guid'],
                video_library_id=str(settings.BUNNY_STREAM_LIBRARY_ID),
                status='processing',
            )
        except Exception as err:
            logger.error("Bunny upload failed: %s", err)
            return Response({'error': 'Unable to upload video to Bunny Stream'}, status=502)

        return Response({'video_id': str(video.id), 'bunny_video_id': video.bunny_video_id}, status=201)


class VideoViewSet(ModelViewSet):
    """
    Handles GET and POST requests aimed at the Video model.

    Inheritance:
    	ModelViewSet - Passes a set of 'default actions' method for HTTP verbs.
    """

    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Handles GET requests of Video instances.

        Params:
        	self - A python representation of the view's instantiation.

        Return:
        	A filtered Django model query set.
        """

        return Video.objects.filter(owner=self.request.user)
