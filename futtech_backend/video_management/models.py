#!/usr/bin/env python3
"""
'video_management/models.py' contains definitions of all DB tables required
for this App to handle CRUD operations facilitating video streaming.
"""

import uuid
from django.db import models
# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from .choices import (
    PlayerPosition, UserSex,
    VideoStatus, VideoCategory,
    VideoPolicy
)
from django.utils import timezone


UserModel = get_user_model()


class Team(models.Model):
    """
    Represents a Team accessing the 'Enterprise' subscription plan.

    Inheritance:
    	models.Model - Base class enabling access to the 'batteries-included'
    	out-of-the-box 'BaseModel' class: 'The metaclass for all class models.'
    """

    team_name = models.CharField(max_length=100)

    subscription = models.ForeignKey('djstripe.Subscription',
                                     null=True,
                                     blank=True,
                                     on_delete=models.SET_NULL,
                                     help_text="The team's Stripe subscription object, if it exists")
    customer = models.ForeignKey('djstripe.Customer',
                                 null=True,
                                 blank=True,
                                 on_delete=models.SET_NULL,
                                 help_text="The team's Stripe Customer object, if it exists")

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        Defines the 'string representation' of any instance of
        the 'Team' class.

        Return:
        	The name associated with the instantiated team.
        """
        return self.team_name


class UserProfile(models.Model):
    """
    Extends the built-in User model to store application-specific data.

    Inheritance:
    	models.Model - Base class enabling access to Django's "Modelbase",
    	which itself is the 'Metaclass for all models'.
    """

    user = models.OneToOneField(UserModel,
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

    # Stripe integration fields
    subscription = models.ForeignKey('djstripe.Subscription',
                                     null=True,
                                     blank=True,
                                     on_delete=models.SET_NULL,
                                     help_text="The user's Stripe subscription object, if it exists")
    customer = models.ForeignKey('djstripe.Customer',
                                 null=True,
                                 blank=True,
                                 on_delete=models.SET_NULL,
                                 help_text="The user's Stripe Customer object, if it exists")
    team = models.ForeignKey(Team,
                             null=True,
                             blank=True,
                             on_delete=models.SET_NULL,
                             related_name='members',
                             help_text='The team whose enterprise subscription a user has access to')

    def __str__(self):
        """
        Defines the 'string representation' of any instance of
        the 'UserProfile' class.

        Return:
        	The username associated with the instantiated user.
        """
        return self.user.username


class Video(models.Model):
    """
    Represents a video asset within the platform (Inside Futtech).

    Inheritance:
    	models.Model - Base class enabling access to the 'batteries-included'
    	out-of-the-box 'BaseModel' class: 'The metaclass for all class models.'
    """

    id = models.UUIDField(primary_key=True,
                          default=uuid.uuid4,
                          editable=False)
    owner = models.ForeignKey(UserModel,
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
        instantiation of this Video model.

        Return:
        	The video title as well as the owner's username.
        """
        return "'{}' by {}".format(self.title,
                                   self.owner.username)


class PlaybackHistory(models.Model):
    """
    Tracks the watch progress for a user on a specific video.

    Inheritance:
    	models.Model - Base class enabling access to the 'batteries-included'
    	out-of-the-box 'BaseModel' class: 'The metaclass for all class models.'
    """

    user = models.ForeignKey(UserModel,
                             on_delete=models.CASCADE)
    video = models.ForeignKey(Video,
                              on_delete=models.CASCADE)
    watch_progress = models.PositiveIntegerField() # Store progress in seconds
    last_watched_at = models.DateTimeField(auto_now=True)

    class Meta:
        # A user has one history record per video
        unique_together = ('user', 'video')
        verbose_name = 'Video watch progress'
        verbose_name_plural = 'Videos watch progress'

    def __str__(self):
        """
        Defines the 'string representation' of any instance of
        the 'PlaybackHistory' class.

        Return:
        	A description of WHO watched WHAT and for what DURATION.
        """
        return '{} watched {} for {}s'.format(self.user.username,
                                              self.video.title,
                                              self.watch_progress)
