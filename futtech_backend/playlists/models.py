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
    Blueprint for all playlist objects to be stored in the Database.

    Inheritance:
    	models.Model - Base class for all Django Models.
    """

    name = models.CharField(max_length=255)
    owner = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='playlists',
    )
    description = models.TextField(blank=True,
                                   null=True)

    videos = models.ManyToManyField(
        Video,
        related_name='in_playlists',
    )
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """
        Defines the expected string representation of every subsequent
        instantiation of this Playlist model.

        Param:
        	self - Object representation of the class instantiation.
        Return:
        	The playlist name as well as the owner's username.
        """
        return "'{}' by {}".format(self.name,
                                   self.owner.username)

    class Meta:
        ordering = ['-created_at']
