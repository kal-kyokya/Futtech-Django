#!/usr/bin/env python3
"""
'choices.py' groups all 'models.textChoices' subclasses required for
definition of Django models associated with the video_management App.	
"""

from django.db import models


class PlayerPosition(models.TextChoices):
    """
    Leverages OOP (Object-oriented programming) to avail a list of
    potential position a footballer occupies.

    Inheritance:
            models.TextChoices - Base class facilitating creation of
            enumerated string choices.
    """

    # ----------------------------------------------------------
    # These are tuples created using Python's Tuple Packing
    # ---------------------------------------------------------

    # Goal
    GOALKEEPER = 'goalkeeper', 'Goalkeeper'
    # Defense
    SWEEPER = 'sweeper', 'Sweeper'; CENTERBACK = 'center-back', 'Center-back'; FULLBACK = 'full-back', 'Full-back'; WINGBACK = 'wing-back', 'Wing-back'
    # Midfield
    DEFENSIVEMID = 'defensive midfielder', 'Defensive midfielder'; CENTRALMID = 'central midfielder', 'Central midfielder'; ATTACKINGMID = 'attacking midfielder', 'Attacking midfielder'
    # Attack
    WINGER = 'winger', 'Winger'; STRIKER = 'striker', 'Striker'

    OBSERVER = 'observer', 'Observer'


class UserSex(models.TextChoices):
    """
    Leverages OOP (Object-oriented programming) to avail a list
    sex options for new users.

    Inheritance:
    	models.TextChoices - Base class facilitating creation of
    	enumerated string choices.
    """

    MALE = 'male', 'Male'
    FEMALE = 'female', 'Female'
    BLANK = 'blank', 'Blank'


class VideoStatus(models.TextChoices):
    """
    Leverages OOP (Object-oriented programming) to avail a list of
    states in which the video is at all time during its loading.

    Inheritance:
    	models.TextChoices - Base class facilitating creation of
    	enumerated string choices.
    """

    # These are tuples created using Python's Tuple Packing
    PENDING = 'pending', 'Pending'
    PROCESSING = 'processing', 'Processing'
    READY = 'ready', 'Ready'
    ERROR = 'error', 'Error'


class VideoCategory(models.TextChoices):
    """
    Leverages OOP (Object-oriented programming) to avail a list of
    categories associated with each element.

    Inheritance:
    	models.TextChoices - Base class facilitating creation of
    	enumerated string choices.
    """

    # These are tuples created using Python's Tuple Packing
    GAME = 'game', 'Game'
    TRAINING = 'training', 'Training'


class VideoPolicy(models.TextChoices):
    """
    Leverages OOP (Object-oriented programming) to avail a list of
    playback policy associated with each mux video asset.

    Inheritance:
    	models.TextChoices - Base class facilitating creation of
    	enumerated string choices.
    """

    # These are tuples created using Python's Tuple Packing
    PUBLIC = 'public', 'Public'
    SIGNED = 'signed', 'Signed'
