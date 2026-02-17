#!/usr/bin/env python3
"""
Choice enums for video management models.
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
    Avails a list sex options for new users.

    Inheritance:
    	models.TextChoices - Base class facilitating creation of
    	enumerated string choices.
    """

    MALE = 'male', 'Male'
    FEMALE = 'female', 'Female'
    BLANK = 'blank', 'Blank'


class VideoStatus(models.TextChoices):
    """
    Avails a list of potential video states during its loading.

    Inheritance:
    	models.TextChoices - Base class facilitating creation of
    	enumerated string choices.
    """

    # These are tuples created using Python's Tuple Packing
    CREATED = 'created', 'Created'
    UPLOADING = 'uploading', 'Uploading'
    PROCESSING = 'processing', 'Processing'
    READY = 'ready', 'Ready'
    ERROR = 'error', 'Error'


class VideoCategory(models.TextChoices):
    """
    Avails a list of categories associated with each element.

    Inheritance:
    	models.TextChoices - Base class facilitating creation of
    	enumerated string choices.
    """

    # These are tuples created using Python's Tuple Packing
    GAME = 'game', 'Game'
    TRAINING = 'training', 'Training'
