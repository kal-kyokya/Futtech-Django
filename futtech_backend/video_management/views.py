#!/usr/bin/env python3
"""
API views for video metadata, public showcase and private Bunny playback.
"""

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404

from djstripe.models import Customer
from djstripe.settings import djstripe_settings
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

import stripe # Was pip installed with 'djstripe'

from . import services
from .logs import logger
from .choices import VideoStatus
from .models import PaymentProvider, PaymentTransaction, PaymentStatus, PlaybackHistory, Video
from .payment_services import (
    MpesaClient,
    create_payment_transaction,
    create_stripe_checkout_session,
    get_checkout_price,
    mark_payment_result,
    normalize_kenyan_phone,
    parse_mpesa_callback,
    process_stripe_event,
    serialize_payment,
)
from .serializers import PlaybackHistorySerializer, VideoSerializer, PublicShowcaseVideoSerializer

stripe.api_key = djstripe_settings.STRIPE_SECRET_KEY

def _can_access_video(user, video):
    if video.owner_id == user.id:
        return True
    if not video.is_premium:
        return True
    return user.profile.has_active_subscription()

def _get_video_by_slug(slug):
    return Video.objects.get(slug=slug)


def _get_video_by_id(video_id):
    return Video.objects.get(pk=video_id)


def _get_video_response(request, video):
    if not _can_access_video(request.user, video):
        return HttpResponseForbidden("You do not have permission to view this video.")

    return JsonResponse(VideoSerializer(video).data)


def _get_playback_response(request, video):

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_video_playback(request, video_id):
    try:
        video = _get_video_by_id(video_id)
    except Video.DoesNotExist:
        return JsonResponse({'error': 'Video not found'}, status=404)

    return _get_playback_response(request, video)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_video_playback_by_slug(request, slug):
    try:
        video = _get_video_by_slug(slug)
    except Video.DoesNotExist:
        return JsonResponse({'error': 'Video not found'}, status=404)

    return _get_playback_response(request, video)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_video_data(request, video_id):
    try:
        video = _get_video_by_id(video_id)
    except Video.DoesNotExist:
        return JsonResponse({'error': 'Video not found'}, status=404)

    return _get_video_response(request, video)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_video_data_by_slug(request, slug):
    try:
        video = _get_video_by_slug(slug)
    except Video.DoesNotExist:
        return JsonResponse({'error': 'Video not found'}, status=404)

    return _get_video_response(request, video)


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

    videos = Video.objects.filter(
        is_premium=False,
        status=VideoStatus.READY
    ).order_by('-created_at')[:limit]
    return Response(VideoSerializer(videos, many=True).data)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_public_showcase(request):
    try:
        limit = int(request.query_params.get('limit', 12))
    except (TypeError, ValueError):
        limit = 12

    limit = max(1, min(limit, 30))

    videos = Video.objects.filter(
        is_showcase=True,
        status=VideoStatus.READY,
    ).order_by('title')[:limit]

    return Response(PublicShowcaseVideoSerializer(videos, many=True).data)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_public_showcase_detail(request, slug):
    video = get_object_or_404(
        Video,
        slug=slug,
        is_showcase=True,
        status=VideoStatus.READY,
    )

    return Response(PublicShowcaseVideoSerializer(video).data)


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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_checkout(request):
    provider = (request.data.get('provider') or '').upper()
    if provider not in {PaymentProvider.MPESA, PaymentProvider.STRIPE}:
        return Response({'error': 'Unsupported payment provider.'}, status=400)

    amount, currency = get_checkout_price(provider)
    payment = create_payment_transaction(
        user=request.user,
        provider=provider,
        amount=amount,
        currency=currency,
        purpose='subscription',
    )

    if provider == PaymentProvider.MPESA:
        phone_number = request.data.get('phone_number', '')
        try:
            normalized_phone = normalize_kenyan_phone(phone_number)
        except ValueError as err:
            payment.status = PaymentStatus.FAILED
            payment.error_message = str(err)
            payment.save(update_fields=['status', 'error_message', 'updated_at'])
            return Response({'error': str(err)}, status=400)

        callback_url = settings.MPESA_CALLBACK_URL
        if not callback_url:
            return Response({'error': 'MPESA_CALLBACK_URL is not configured.'}, status=500)

        try:
            payment.status = PaymentStatus.PROCESSING
            payment.metadata = {**payment.metadata, 'phone_number': normalized_phone}
            payment.save(update_fields=['status', 'metadata', 'updated_at'])

            mpesa_response = MpesaClient().initiate_stk_push(
                phone_number=normalized_phone,
                amount=amount,
                account_reference=str(payment.external_reference),
                transaction_desc='Futtech Subscription',
                callback_url=callback_url,
            )
            payment.provider_checkout_request_id = mpesa_response.get('CheckoutRequestID', '')
            payment.provider_transaction_id = mpesa_response.get('MerchantRequestID', '')
            payment.metadata = {**payment.metadata, 'mpesa_initiate_response': mpesa_response}
            payment.save(update_fields=['provider_checkout_request_id', 'provider_transaction_id', 'metadata', 'updated_at'])
            return Response({
                **serialize_payment(payment),
                'message': 'Check your phone and enter your M-Pesa PIN to complete payment.',
            }, status=202)
        except Exception as err:
            logger.exception('M-Pesa initiation failed: %s', err)
            mark_payment_result(payment, PaymentStatus.FAILED, error_message='Failed to intiate M-Pesa STK push.')
            return Response({'error': 'Unable to intiate M-Pesa at this time. Please try again.'}, status=502)

    try:
        session = create_stripe_checkout_session(payment, request)
    except ValueError as err:
        mark_payment_result(payment, PaymentStatus.FAILED, error_message=str(err))
        return Response({'error': str(err)}, status=500)
    except Exception as err:
        logger.exception('Stripe session initiation failed: %s', err)
        mark_payment_result(payment, PaymentStatus.FAILED, error_message='Failed to initiate Stripe checkout.')
        return Response({'error': 'Unable to initiate Stripe at this time. Please try again.'}, status=502)

    return Response({
        **serialize_payment(payment),
        'redirect_url': session.url,
    }, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, transaction_id):
    payment = PaymentTransaction.objects.filter(id=transaction_id, user=request.user).first()
    if not payment:
        return Response({'error': 'Payment transaction not found'}, status=404)
    return Response(serialize_payment(payment), status=200)


@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def mpesa_callback(request):
    payload = request.data if isinstance(request.data, dict) else {}
    parsed = parse_mpesa_callback(payload)
    checkout_request_id = parsed.get('checkout_request_id')
    if not checkout_request_id:
        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'}, status=200)

    payment = PaymentTransaction.objects.filter(
        provider=PaymentProvider.MPESA,
        provider_checkout_request_id=checkout_request_id,
    ).first()
    if not payment:
        logger.warning('M-Pesa callback could not map checkout request id %s', checkout_request_id)
        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'}, status=200)

    callback_metadata = {
        'mpesa_callback': payload,
        'mpesa_receipt': parsed.get('mpesa_receipt', '')
    }
    if parsed.get('result_code') == '0':
        mark_payment_result(
            payment,
            PaymentStatus.SUCCEEDED,
            provider_transaction_id=parsed.get('mpesa_receipt', '') or payment.provider_transaction_id,
            metadata=callback_metadata,
        )
    else:
        mark_payment_result(
            payment,
            PaymentStatus.FAILED,
            error_code=parsed.get('result_code', ''),
            error_message=parsed.get('result_desc', 'M-Pesa transaction failed'),
            metadata=callback_metadata,
        )

    return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'}, status=200)


@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def stripe_callback(request):
    signature = request.META.get('HTTP_STRIPE_SIGNATURE', '')
    payload = request.body
    try:
        event_type = process_stripe_event(payload, signature)
    except ValueError as err:
        return Response({'error': str(err)}, status=400)
    except stripe.error.SignatureVerificationError:
        return Response({'error': 'Invalid Stripe signature.'}, status=400)
    except Exception as err:
        logger.exception('Stripe callback processing failed: %s', err)
        return Response({'error': 'Webhook processing failed.'}, status=500)

    return Response({'status': 'ok', 'event_type': event_type}, status=200)


class PlaybackHistoryView(APIView):
    """
    Handles POST or PATCH request to update video watch progress.

    Inheritance:
    	APIView - Empowers this view with a set of predefined class attributes
    		  from the 'Base of all views in REST Framework'.
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication, SessionAuthentication]

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
