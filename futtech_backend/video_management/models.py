#!/usr/bin/env python3
"""
'video_management/models.py' contains definition of all the necessary DB tables
required for Futtech's video management App to handle CRUD operations leading
to product delivery.
"""

import uuid
from django.db import models
from django.contrib.auth.models import User


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

    def __str__(self):
        """
        Defines the 'string representation' of any instance of
        the 'UserProfile' class.

        Return:
        	The username associated with the instanciated user.
        """
        return self.user.username
