#!/usr/bin/env python3
"""
'video_management.views.py' is the entry point to this application's
Business logic and Data layer, for defined set of URLs.
"""

import os
from dotenv import load_dotenv

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import get_user_model # Reliable way to get the correct/active User model class.
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.views.decorators.http import require_POST

from djstripe.settings import djstripe_settings
from djstripe.models import Subscription

import stripe # Was pip installed when the 'djstripe' module was.

from .logs import logger
from .models import Video
from . import services


load_dotenv()


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


@login_required
def subscription_confirm(request):
    """
    Provisions a user with the subscription paid for.

    Params:
    	request - The object representation of the frontend request made.

    Return:
    	A redirect to Stripe's customer portal for subscription management.
    """

    # Configure the 'stripe object' for secure consumption of its API
    stripe.api_key = djstripe_settings.STRIPE_SECRET_KEY

    # Extract the session ID from the URL & fetch its associated Stripe session
    session_id = request.GET.get(session_id)
    session = stripe.checkout.Session.retrieve(session_id)

    # Ensure match between he whom initiated the session and a user in our DB
    client_reference_id = int(session.client_reference_id)
    subscription_holder = get_user_model().objects.get(id=client_reference_id)

    assert client_reference_id == subscription_holder

    # Think of a subscription as a contract between Futtech and a user
    # This finds the contract and stores it on our local machine
    subscription = stripe.Subscription.retrieve(session.subscription)
    djstripe_subscription = Subscription.sync_from_stripe_data(subscription)

    # Update our user's subscription field to allow streaming
    subscription_holder.subscription = djstripe_subscription
    subscription_holder.customer = djstripe_subscription.customer
    subscription_holder.save()

    # Notify the user of the subscription status and redirect
    messages.success(request, f"You have successfully signed up. Thanks for the support!")
    return HttpResponseRedirect(reverse("create_portal_session"))


@login_required
@require_POST
def create_portal_session(request):
    """
    Allows user to access Stripe's customer portal and manage subscriptions.

    Param:
    	request - A dictionary object representing the client-side request.

    Return:
    	A redirect to Stripe's customer portal.
    """

    stripe.api_key = djstripe_settings.STRIPE_SECRET_KEY
    return_path = 'https://{}/subscription-details'.format(
        os.environ.get(DOMAIN_NAME)
    )

    portal_session = stripe.billing_portal.Session.create(
        customer=request.user.customer.id,
        return_url=return_path,
    )

    return HttpResponseRedirect(portal_session.url)
