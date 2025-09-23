#!/usr/bin/env python3
"""
'views.py' handles all HTTP requests made to the Django backend for
	   playlist-related data.
"""

from rest_framework import viewsets, permissions
from .models import Playlist
from .serializers import PlaylistSerializer

