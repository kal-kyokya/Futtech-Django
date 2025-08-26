#!/usr/bin/env python3
"""
'video_management/admin.py' registers this App's models to the admin App
and enables super user manipulation of said models in a browser tab.
"""

from django.contrib import admin
from .models import UserProfile, Video


class VideoAdmin(admin.ModelAdmin):
    """
    Enables customization of the Video appearance on the admin page.

    Inheritance:
    	admin.ModelAdmin - Described as 'Encapsulating all admin options and
    	functionality for a given model', here allows declaration of desired
    	fields to be displayed on the admin page.
    """

    list_display = ['title', 'created_at']


admin.site.register([UserProfile, VideoAdmin, Video])
