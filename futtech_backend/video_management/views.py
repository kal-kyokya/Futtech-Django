#!/usr/bin/env python3
"""
'video_management.views.py' is the entry point to this application's
Business logic and Data layer, for defined set of URLs.
"""

from django.http import JsonResponse, HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from django.conf import settings
from djstripe.settings import djstripe_settings
from .logs import logger
from .models import Video
from . import services


@login_required
def get_video_data(request, video_id):
    """
    Handles HTTP requests for Mux video assets.

    Params:
    	request - A dictionary object representing the client's request.
    	video_id - A string representing the requested Mux asset ID.

    Return:
    	A JSON Web Token containing a signed version of the playback ID.
    """

    try:
        video = Video.objects.get(pk=video_id)
    except Video.DoesNotExist as err:
        logger.error("Error retrieving video ID - {} from DB: {}".format(
            video_id, err
        ))

    # We check if the user is logged in.
    if not video.is_premium or request.user.is_authenticated:
        return JsonResponse({'video': video})
    else:
        logger.info("Unauthorized request for a playback ID.")
        return HttpResponseForbidden("You do not have permission to view this video.")


@login_required
def get_playback_token(request, video_id):
    """
    Handles HTTP requests for playback-ready Mux video assets.

    Params:
    	request - A dictionary object representing the client's request.
    	video_id - A string representing the requested Mux asset ID.

    Return:
    	A JSON Web Token containing a signed version of the playback ID.
    """

    try:
        video = Video.objects.get(pk=video_id)
    except Video.DoesNotExist as err:
        logger.error("Error retrieving video ID - {} from DB: {}".format(
            video_id, err
        ))

    # Later on, we shall add subscription checks here.
    # For now, we just check if the user is logged in.
    if not video.is_premium or request.user.is_authenticated:
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
def get_pricing_page_identifiers(request):
    """
    Provides the keys and IDs required for usage of Stripe's pricing table.

    Params:
    	request - Dictionary object containing client-side data needed to
    		  effectively respond to the user's request.

    Return:
    	A JSON object bundling together all necessary identifiers.
    """

    return JSONResponse({
        'stripe_public_key': djstripe_settings.STRIPE_PUBLIC_KEY,
        'stripe_pricing_table_id': settings.STRIPE_PRICING_TABLE_ID
    })
