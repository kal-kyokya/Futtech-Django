#!/usr/bin/env python3
"""
'views.py' handles all HTTP requests made to the Django backend for
	   playlist-related operations.
"""

from django.db import models
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Playlist
from .serializers import PlaylistSerializer
from .pagination import PlaylistPagination
from .permissions import IsOwnerOrReadOnly


class PlaylistViewSet(viewsets.ModelViewSet):
    """
    Handles GET and POST requests directed towards the Playlist model.

    Inheritance:
    	viewsets.ModelViewSet - Predefines 'default actions' methods (CRUD)
    				'list(), retrieve(), create(), etc'.
    """

    serializer_class = PlaylistSerializer
    pagination_class = PlaylistPagination
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

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


    def get_queryset(self):
        """
        Ensures videos are prefetched for all playlists in one DB hit
        """
        user = self.request.user

        if self.action in {'update', 'partial_update', 'destroy'}:
            queryset = Playlist.objects.all().prefetch_related('videos')
        else:
            queryset = Playlist.objects.filter(
                models.Q(owner=user) | models.Q(is_public=True)
            ).prefetch_related('videos')

        return queryset


    def list(self, request, *args, **kwargs):
        """
        Ensures results are paginated and wrapped in DRF's pagination response.
        Uses prefetch_related to avoid N+1 queries.

        Param:
        	self - A representation of the currently processed
        	       PlaylistViewSet instance.
        	request - The HTTP request object attach to this API call.

        Return:
        	A paginated list of playlists with their related videos.
        """

        # Applies any filter (e.g., search, custom filters, permissions)
        queryset = self.filter_queryset(self.get_queryset())

        # Slices the queryset according to the custom pagination rules
        page = self.paginate_queryset(queryset)

        if page is not None:
            # Serializes that page of Playlist objects into JSON
            serializer = self.get_serializer(page, many=True)

            # Wraps the serialized data with pagination metadata
            # (like count, next, previous, results)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
