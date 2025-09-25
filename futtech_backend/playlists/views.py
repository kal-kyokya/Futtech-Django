#!/usr/bin/env python3
"""
'views.py' handles all HTTP requests made to the Django backend for
	   playlist-related data.
"""

from django.db import models
from rest_framework import viewsets, permissions
from .models import Playlist
from .serializers import PlaylistSerializer


class PlaylistViewSet(viewsets.ModelViewSet):
    """
    Handles GET and POST requests directed towards the Playlist model.

    Inheritance:
    	viewsets.ModelViewSet - A viewset providing a list of
    				'default actions' method such as
    				'create(), retrieve(), list(), etc'.
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
        	A Django model query set containing every public playlist.
        """

        user = self.request.user
        return Playlist.objects.filter(
            models.Q(owner=user) | models.Q(is_public=True)
        )

    def perform_create(self, serializer):
        """
        Handles POST request creating new playlists.

        Params:
        	self - Object representation of the class instantiation.
        	serializer - A validated Django model friendly data set.

        Return:
        	None. A side effect: The creation of a playlist.
        """
        serializer.save(owner=self.request.user)
