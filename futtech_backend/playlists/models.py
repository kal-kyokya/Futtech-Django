#!/usr/bin/env python3
"""
'models.py' contains definition of the Django models required for
	    effective CRUD operations on Futtech's playlists.
"""

from django.db import models
from django.conf import settings


class Playlist(models.Model):
    """
    Blueprint for all playlist objects to be stored in DB.

    Inheritance:
    	models.Model - Base class for all Django Models.
    """
