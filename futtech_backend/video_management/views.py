#!/usr/bin/env python3
"""
'video_management.views.py' is the entry point to this application's
private layer (logic and data tiers), accessed via declared URL patterns.
"""

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import get_user_model # Reliable way to get the correct/active User model class.
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt

from djstripe.settings import djstripe_settings
from djstripe.models import Customer, Subscription

from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view

from mux_python.rest import ApiException

from playlists.serializers import VideoSerializer

from . import services
from .logs import logger
from .models import Video
from .serializers import VideoUploadSerializer, PlaybackHistorySerializer


import stripe # Was pip installed with 'djstripe'


# Configure the stripe for secure consumption of its API
stripe.api_key = djstripe_settings.STRIPE_SECRET_KEY


@login_required
def get_playback_token(request, video_id):
    """
    Handles GET requests for playback-ready Mux video assets.

    Params:
    	request - A dictionary object representing the client's request.
    	video_id - A string representing the requested Mux asset ID.

    Return:
    	A JSON Web Token containing a signed version of the
    	requested video's playback ID.
    """

    try:
        video = Video.objects.get(pk=video_id)
    except Video.DoesNotExist as err:
        logger.error("Error retrieving video ID - {} from DB: {}".format(
            video_id, err
        ))

    # Ensures that the video is free to watch or the user is subscribed
    if not video.is_premium or request.user.profile.has_active_subscription():
        token = services.generate_signed_playback_token(
            video.mux_playback_id
        )
        if token:
            return JsonResponse({'token': token})
        else:
            return JsonResponse(
                {'error': 'Could not generate token'}, status=500
            )

    logger.info("Unauthorized request for a playback ID.")
    return HttpResponseForbidden("You do not have permission to view this video.")


@login_required
def get_video_data(request, video_id):
    """
    Handles GET requests for Mux video assets.

    Params:
    	request - A dictionary object representing the frontend request.
    	video_id - A string representing the requested video ID in DB.

    Return:
    	A JSON response containing the requested Video model instance.
    """

    try:
        video = Video.objects.get(pk=video_id)
    except Video.DoesNotExist as err:
        logger.error("Error retrieving video ID - {} from DB: {}".format(
            video_id, err
        ))

    # We make sure that the video belongs to the requesting user
    if video.owner == request.user:
        return JsonResponse({'video': video})
    else:
        logger.info(f"Unauthorized request for video {video_id}.")
        return HttpResponseForbidden("You do not have permission to view this video.")


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
    Provisions a user with the newly paid for subscription.

    Params:
    	request - The object representation of the frontend request.

    Return:
    	A redirect to Stripe's customer portal for subscription management.
    """

    # Extract the session ID from the URL & fetch its associated Stripe session
    session_id = request.GET.get(session_id)
    session = stripe.checkout.Session.retrieve(session_id)

    # Ensure match between he who initiated the session and a user in our DB
    client_reference_id = int(session.client_reference_id)
    subscription_holder = get_user_model().objects.get(id=client_reference_id)

    assert client_reference_id == subscription_holder

    # Think of a subscription as a contract between Futtech and a user
    # This finds the contract and stores it locally
    subscription = stripe.Subscription.retrieve(session.subscription)
    djstripe_subscription = Subscription.sync_from_stripe_data(subscription)

    # Update our user's subscription field to allow streaming
    subscription_holder.subscription = djstripe_subscription
    subscription_holder.customer = djstripe_subscription.customer
    subscription_holder.save()

    # Notify the user of the subscription status and redirect
    messages.success(request, f"You have successfully subscribed. Thanks for the support!")
    return HttpResponseRedirect(reverse("create_portal_session"))


@login_required
@require_POST
def create_portal_session(request):
    """
    Allows users to access Stripe's customer portal and manage subscriptions.

    Param:
    	request - A dictionary object representing the HTTP request.

    Return:
    	A redirect to Stripe's customer portal.
    """

    return_path = 'https://{}/stripe-profile/'.format(settings.DOMAIN_NAME)

    portal_session = stripe.billing_portal.Session.create(
        customer=request.user.customer.id,
        return_url=return_path,
    )

    # I'm tempted to think that this should be a JSONResponse
    return HttpResponseRedirect(portal_session.url)


@login_required
@require_POST
def create_checkout_session(request):
    """
    Handles client-side requests for a Stripe checkout session.

    Param:
    	request - The user request having initiated this workflow.

    Return:
    	A checkout URL generated by the Stripe API.
    """

    price_id = request.POST.get('price_id')

    # Get or create a Stripe Customer for the logged-in user
    customer, _ = Customer.get_or_create(subscriber=request.user)

    try:
        checkout_session = stripe.checkout.Session.create(
            customer=customer.id,
            success_url=settings.DOMAIN_NAME + '/success/',
            cancel_url=settings.DOMAIN_NAME + '/cancel',
            payment_method_types=['card'],
            mode='subscription',
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
        )
        return JsonResponse({'checkout_url': checkout_session.url})

    except Exception as err:
        logger.error("Error checking out price ID - {} from Stripe: {}".format(
            price_id, err
        ))
        return JsonResponse(
            {'error': str(err)},
            status=500
        )


class UpdateWatchProgressView(APIView):
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


class VideoViewSet(ModelViewSet):
    """
    Handles GET and POST request on the Video model.

    Inheritance:
    	ModelViewSet - A set of 'default actions' method for HTTP verbs.
    """

    serializer_class = VideoSerializer
    permissions_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Handles GET requests of Video instances.

        Params:
        	self - A python representation of the view's instantiation.

        Return:
        	A filtered Django model query set.
        """

        return Video.objects.filter(owner=self.request.user,
                                    status='ready')


class VideoUploadView(APIView):
    """
    Handles on-demand provision of MUX direct upload URLs to the frontend.

    Inheritance:
    	APIView - Empowers this view with a set of predefined class attributes
    		  from the 'Base of all views in Django REST Framework'.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Handles calls for MUX direct uploads and stores metatata.

        Params:
        	self - An instance of the current class-based view.
        	request - The client-side generated HTTP request object.

        Return:
        	A DRF response object containing the video ID, the
        	upload URL, as well as the Mux upload ID.
        """

        upload = services.create_direct_upload_url()

        serializer_output = VideoUploadSerializer(data=request.data)
        if serializer_output.is_valid():
            data = serializer_output.valid_data

            # Create the video inside our Django model - 'Video'
            video = Video.objects.create(
                owner=request.user,
                title=data['title'],
                description=data['description'],
                is_premium=data['is_premium'],
                is_drone=data['is_drone'],
                is_analysis=data['is_analysis'],
                mux_upload_id=upload.id,
                status='pending'
            )

            return Response(
                {
                    'video_id': video.id,
                    'mux_upload_id': upload.id,
                    'upload_url': upload.url,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer_output.errors, status=400)


class UploadCompleteView(APIView):
    """
    Handles post upload workflows such as confirmation of video presence in DB.

    Inheritance:
    	APIView - Empowers this view with a set of predefined class attributes
    		  from the 'Base of all views in Django REST Framework'.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, video_id):
        """
        Marks upload as completed, once the frontend finishes direct upload.

        Params:
        	self - The current instance of the APIView subclass.
        	request - A dictionary-like python object containing
        		  the frontend's request data.
        	video_id - A unique identifier tied to the Video model.

        Return:
        	A DRF response object containing the video and Mux asset IDs.
        """

        try:
            video = Video.objects.get(id=video_id,
                                      owner=request.user)
        except Video.DoesNotExist:
            return Response({'error': 'Video not found'},
                            status=404)

        # Fetch the asset linked to the upload
        try:
            upload = services.uploads_api.get_direct_upload(
                video.mux_upload_id
            )
            asset_id = upload.data.asset_id
        except ApiException:
            return Response({'error': 'Mux upload not ready'},
                            status=400)

        video.mux_asset_id = asset_id
        video.status = 'processing'
        video.save()

        return Response({
            'video_id': video.id,
            'mux_asset_id': asset.id
        })


@csrf_exempt
@api_view(['POST'])
def mux_webhook(request):
    """
    Listens for webhooks updating the upload status of video files.

    Param:
    	request - A Python dictionary-like object containing Mux data.

    Return:
    	A DRF Response object declaring the upload status.
    """

    verification_status = services.handle_mux_webhook(
        request,
        request.headers.get('Mux-Signature')
    )

    return Response({'status': verification_status})
