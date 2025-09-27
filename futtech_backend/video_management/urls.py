#!/usr/bin/env python3
"""
'video_management/urls.py' is a URL configuration file.

'The `urlpatterns` list' routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""

from django.urls import path
from . import views


urlpatterns = [
    path('video/<uuid:video_id>/get-playback-token/',
         views.get_playback_token,
         name='get_playback_token'),
    path('video/<uuid:video_id>/',
         views.get_video_data,
         name='get_video_data'),
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
    path('videos/',
         views.VideoViewSet.as_view(),
         name='crud-videos'),
]
