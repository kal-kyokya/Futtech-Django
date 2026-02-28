#!/usr/bin/env python3
"""
'video_management/models.py' contains definitions of all DB tables required
for this App to handle CRUD operations facilitating video streaming.
"""

import uuid
import datetime
from django.db import models
# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from .choices import (
    PlayerPosition, UserSex,
    VideoStatus, VideoCategory,
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
    	models.Model - Base class enabling access to the Django
		       Modelbase class: The Metaclass for all models.
    """

    user = models.OneToOneField(UserModel,
                                on_delete=models.CASCADE,
                                primary_key=True,
                                related_name='profile')
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
                             related_name='team_members',
                             help_text='The team whose enterprise subscription a user has access to')

    # Provider-agnostic access marker used by non-stripe providers.
    access_expires_at = models.DateTimeField(null=True,
                                             blank=True)

    def has_active_subscription(self):
        """
        Runs a series of checks permitting a user to stream Futtech content.

        Param:
        	self - A representation of the current UserProfile instance.

        Return:
        	A boolean determining whether or not a user is subscribed.
        """

        if self.access_expires_at and self.access_expires_at >= timezone.now():
            return True

        if not self.subscription:
            return False

        # Include a 10-day grace period for subscriptions past due
        if self.subscription.status == 'past_due':
            current_time = timezone.now()
            period_end = datetime.datetime.fromtimestamp(
                self.subscription.current_period_end,
                tz=datetime.timezone.utc
            )
            days_past_due = (current_time - period_end).days
            return days_past_due <= 10

        return self.subscription.status == 'active'


class PaymentProvider(models.TextChoices):
    MPESA = 'MPESA', 'M-Pesa'
    STRIPE = 'STRIPE', 'Stripe'


class PaymentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    PROCESSING = 'PROCESSING', 'Processing'
    SUCCEEDED = 'SUCCEEDED', 'Succeeded'
    FAILED = 'FAILED', 'Failed'
    CANCELED = 'CANCELED', 'Canceled'
    EXPIRED = 'EXPIRED', 'Expired'


class PaymentTransaction(models.Model):
    id = models.UUIDField(default=uuid.uuid4,
                          editable=False,
                          primary_key=True)
    user = models.ForeignKey(UserModel,
                             on_delete=models.CASCADE,
                             related_name='payment_transactions')
    provider = models.CharField(choices=PaymentProvider.choices,
                                max_length=20)
    status = models.CharField(choices=PaymentStatus.choices,
                              default=PaymentStatus.PENDING,
                              max_length=20)
    amount = models.DecimalField(decimal_places=2,
                                 max_digits=10)
    currency = models.CharField(default='KES',
                                max_length=3)
    purpose = models.CharField(default='subscription',
                               max_length=64)
    external_reference = models.CharField(blank=True,
                                          default='',
                                          max_length=255)
    merchant_reference = models.CharField(blank=True,
                                          default='',
                                          max_length=255)
    provider_transaction_id = models.CharField(blank=True,
                                               default='',
                                               max_length=255)
    provider_checkout_request_id = models.CharField(blank=True,
                                                    default='',
                                                    max_length=255)
    metadata = models.JSONField(blank=True,
                                default=dict)
    idempotency_key = models.CharField(max_length=128,
                                       unique=True)
    error_code = models.CharField(blank=True,
                                  default='',
                                  max_length=128)
    error_message = models.TextField(blank=True,
                                     default='')
    fulfilled_at = models.DateTimeField(blank=True,
                                        null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['provider', 'status']),
            models.Index(fields=['provider_checkout_request_id']),
            models.Index(fields=['external_reference']),
        ]

    def __str__(self):
        return f"{self.id} {self.provider} {self.status}"


class Video(models.Model):
    """
    Blueprint of every video asset within the platform (i.e., Inside Futtech).

    Inheritance:
    	models.Model - Base class enabling access to the 'batteries-included'
    		       out-of-the-box 'BaseModel' class:
    		       'The metaclass for all class models'.
    """

    id = models.UUIDField(primary_key=True,
                          default=uuid.uuid4,
                          editable=False)
    owner = models.ForeignKey(UserModel,
                              on_delete=models.CASCADE,
                              related_name='uploaded_videos')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True,
                                   null=True)

    # Bunny Stream fields
    video_library_id = models.CharField(max_length=64,
                                        null=True,
                                        blank=True)
    bunny_video_id = models.CharField(max_length=255,
                                      unique=True,
                                      null=True,
                                      blank=True)

    status = models.CharField(max_length=20,
                              choices=VideoStatus.choices,
                              default=VideoStatus.CREATED)
    duration_seconds = models.PositiveIntegerField(null=True,
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

        Param:
        	self - Object representation of the class instantiation.
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
