#!/usr/bin/env python3
"""
'video_management/models.py' contains definitions of all DB tables required
for this App to handle CRUD operations facilitating video streaming.
"""

import uuid
from django.db import models
from django.contrib.auth.models import User
from .choices import PlayerPosition, UserSex, VideoStatus, VideoCategory, VideoPolicy


class UserProfile(models.Model):
    """
    Extends the built-in User model to store application-specific data.

    Inheritance:
    	models.Model - Base class enabling access to Django's "Modelbase",
    	which itself is the 'Metaclass for all models'.
    """

    user = models.OneToOneField(User,
                                on_delete=models.CASCADE,
                                primary_key=True)
    avatar_url = models.URLField(max_length=512,
                                 null=True,
                                 blank=True)
    bio = models.TextField(null=True,
                           blank=True)
    position = models.CharField(max_length=20,
                                choices=PlayerPosition.choices,
                                default=PlayerPosition.OBSERVER)
    profession = models.CharField(help_text='Professional footballer, Engineer, Business owner...',
                                  max_length=255,
                                  null=True,
                                  blank=True)
    sex = models.CharField(max_length=6,
                           choices=UserSex.choices,
                           default=UserSex.BLANK)
    birthday = models.DateField(null=True,
                                blank=True)
    phone = models.CharField(help_text='+123456789, 0123456789, 123456789',
                             max_length=13,
                             null=True,
                             blank=True)
    location = models.CharField(help_text='Current place of residence.',
                                max_length=168,
                                null=True,
                                blank=True)
    active_footballer = models.BooleanField(default=True)

    def __str__(self):
        """
        Defines the 'string representation' of any instance of
        the 'UserProfile' class.

        Return:
        	The username associated with the instanciated user.
        """
        return self.user.username


class Video(models.Model):
    """
    Represents a video asset within the platform (Inside Futtech).

    Inheritance:
    	models.Model - Base class enabling access to the 'batteries-included'
    	'BaseModel' class described as: 'The metaclass for all class models.'
    """

    id = models.UUIDField(primary_key=True,
                          default=uuid.uuid4,
                          editable=False)
    owner = models.ForeignKey(User,
                              on_delete=models.CASCADE,
                              related_name='videos')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True,
                                   null=True)

    # Mux-specific fields
    mux_asset_id = models.CharField(max_length=255,
                                    unique=True,
                                    null=True,
                                    blank=True)
    mux_playback_id = models.CharField(max_length=255,
                                       unique=True,
                                       null=True,
                                       blank=True)
    mux_playback_policy = models.CharField(max_length=6,
                                           choices=VideoPolicy,
                                           default=VideoPolicy.PUBLIC)

    status = models.CharField(max_length=20,
                              choices=VideoStatus.choices,
                              default=VideoStatus.PENDING)
    duration = models.DurationField(null=True,
                                    blank=True)
    is_premium = models.BooleanField(default=False)
    is_drone = models.BooleanField(default=False)
    is_analysis = models.BooleanField(default=False)

    location = models.CharField(help_text='Place of video recording.',
                                max_length=168,
                                null=True,
                                blank=True)
    category = models.CharField(max_length=10,
                                choices=VideoCategory.choices,
                                default=VideoCategory.TRAINING)
    recorded_on = models.DateField(null=True,
                                   blank=True)
    thumbnail = models.URLField(max_length=512,
                                null=True,
                                blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        Defines the expected string representation of every subsequent
        instanciation of this Video model.

        Return:
        	The video title as well as the owner's username.
        """
        return "'{}' by {}".format(self.title,
                                   self.owner.username)
