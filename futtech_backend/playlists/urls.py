#!/usr/bin/env python3
"""
'playlists.urls' establishes routing between URLs and Django views.
"""

from django.urls import path
from .views import PlaylistViewSet


urlpatterns = [
    path('',
         PlaylistViewSet.as_view({
             'get': 'list',
             'post': 'create'
         }),
         name='playlist-list'
    ),
    path(
        '<int:pk>/videos/',
        PlaylistViewSet.as_view({
            'get': 'videos',
        }),
        name='playlist-videos',
    ),
    path(
        '<int:pk>/',
        PlaylistViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy',
        }),
        name='playlist-detail',
    ),
]
