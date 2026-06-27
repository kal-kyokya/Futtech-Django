#!/usr/bin/env python3
"""
'video_management/admin.py' registers this App's models to the admin App
and enables super user manipulation of said models in a browser tab.
"""

from django.contrib import admin
from .models import Team, UserProfile, Video


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    """
    Enables customization of the Video appearance on the admin page.

    Inheritance:
    	admin.ModelAdmin - Described as 'Encapsulating all admin options and
    	functionality for a given model', here allows declaration of desired
    	fields to be displayed on the admin page.
    """

    list_display = (
        'title',
        'owner',
        'status',
        'is_showcase',
        'is_premium',
        'bunny_video_id',
        'created_at',
    )
    list_filter = ('status', 'is_showcase', 'is_premium', 'is_drone', 'is_analysis', 'category')
    search_fields = ('title', 'description', 'bunny_video_id', 'owner__username', 'owner__email')
    readonly_fields = ('id', 'slug', 'created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('id', 'owner', 'title', 'slug', 'description')
        }),
        ('Bunny Stream playback', {
            'description': 'Videos are uploaded to Bunny Stream outside Futtech. Add the Bunny library/video identifiers here so Futtech can render playback and showcase embeds.',
            'fields': ('video_library_id', 'bunny_video_id', 'status', 'duration_seconds', 'thumbnail'),
        }),
        ('Visibility and classification', {
            'fields': ('is_showcase', 'is_premium', 'is_drone', 'is_analysis', 'category', 'location', 'recorded_on'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Enables customization of UserProfile appearance on the admin page.

    Inheritance:
    	admin.ModelAdmin - Described as 'Encapsulating all admin options and
    	functionality for a given model', here allows declaration of desired
    	fields to be displayed on the admin page.
    """

    list_display = ('__str__', 'bio')


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    """
    Enables customization of the Team model's appearance on the admin page.

    Inheritance:
    	admin.ModelAdmin - Described as 'Encapsulating all admin options and
    	functionality for a given model', here allows declaration of desired
    	fields to be displayed on the admin page.
    """

    list_display = ('__str__', 'created_at', 'updated_at')


# admin.site.register([UserProfile, VideoAdmin, Video])
