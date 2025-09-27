#!/usr/bin/env python3
"""
'playlists/admin.py' registers this App's models to the admin app
and enables superuser in-browser definitions & manipulations of said models.
"""

from django.contrib import admin
from .models import Playlist


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    """
    Enables customization of the Playlist appearance on the admin page.

    Inheritance:
    	admin.ModelAdmin - Described as 'Encapsulating all admin options and
    	functionality for a given model', here allows declaration of desired
    	fields to be displayed on the admin page.
    """

    list_display = ('name', 'created_at', 'is_public')
