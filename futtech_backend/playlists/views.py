#!/usr/bin/env python3
"""
'views.py' handles all HTTP requests made to the Django backend for
	   playlist-related data.
"""

from rest_framework import viewsets, permissions
from .models import Playlist
from .serializers import PlaylistSerializer


class PlaylistViewSet(viewsets.ModelViewSet):
    """
    Handles GET and POST request acting on the Playlist model.

    Inheritance:
    	viewsets.ModelViewSet - Provides 'default actions' method.
    """

    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Handles GET request for playlist objects.

        Param:
        	self - A representation of the currently processed
        	       PlaylistViewSet instance.

        Return:
        	A Django model query set containing public playlists.
        """
        return Playlist.objects.filter(is_public=True)
