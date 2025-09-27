#!/usr/bin/env python3
"""
'playlists.urls' establishes routing between URLs and Django views.
"""

from django.urls import path
from .views import PlaylistViewSet


urlpatterns = [
    path('',
         PlaylistViewSet.as_view({
             'get': 'retrieve',
             'post': 'create'
         }),
         name='video-playlists'),
]
