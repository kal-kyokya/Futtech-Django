#!/usr/bin/env python3
"""
'models.py' contains definition of the Django models required for
	    effective CRUD operations on Futtech's playlists.
"""

from django.db import models
from django.contrib.auth import get_user_model
from video_management.models import Video


class Playlist(models.Model):
    """
    Blueprint for all playlist objects to be stored in DB.

    Inheritance:
    	models.Model - Base class for all Django Models.
    """

    name = models.CharField(max_length=255)
    owner = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='playlists',
    )

    videos = models.ManyToManyField(
        Video,
        related_name='in_playlists',
    )
    created_at = models.DateTimeField(auto_now_add=True)
