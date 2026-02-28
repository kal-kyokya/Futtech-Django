#!/usr/bin/env python3
"""
URL routing for video management endpoints.
"""

from django.urls import path
from . import views


urlpatterns = [
    # User-heavy URLS
    path('video/<uuid:video_id>/playback/',
         views.get_video_playback,
         name='get_video_playback'),
    path('video/<uuid:video_id>/',
         views.get_video_data,
         name='get_video_data'),
    path('videos/featured/',
         views.get_featured_videos,
         name='featured_videos'),
    path('pricing-page-identifiers/',
         views.get_pricing_page_identifiers,
         name='get_pricing_page_identifiers'),
    path('subscription-confirm',
         views.get_subscription_confirmation,
         name='get_subscription_confirmation'),
    path('create-portal-session/',
         views.create_portal_session,
         name='create_portal_session'),
    path('user/stripe-profile',
         views.create_portal_session,
         name='get_stripe_profile'),
    path('payments/checkout/initiate',
         views.initiate_checkout,
         name='initiate_checkout'),
    path('payments/checkout/status/<uuid:transaction_id>',
         views.payment_status,
         name='payment_status'),
    path('payments/callbacks/mpesa',
         views.mpesa_callback,
         name='mpesa_callback'),
    path('payments/callbacks/stripe',
         views.stripe_callback,
         name='stripe_callback'),

    # Admin-related URLS
    path('video/upload',
         views.VideoUploadView.as_view(),
         name='upload-video'),
    path('videos/',
         views.VideoViewSet.as_view({
             'get': 'list',
         }),
         name='crud-videos'),
]
