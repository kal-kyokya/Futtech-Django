#!/usr/bin/env python3
"""
'playlists.urls' establishes routing between URLs and Django views.
"""

from django.urls import path
from .views import PlaylistViewSet

urlspatterns = [
    path('/',
         PlaylistViewSet.as_view(),
         name='video-playlists'),
]
