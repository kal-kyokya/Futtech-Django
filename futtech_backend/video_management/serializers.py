#!/usr/bin/env python3
"""
'serializers.py' defines a subclass of 'djangorestframework' meant to be
		 attached to the 'PlaybackHistory' model in order to
		 convert every I/O of the 'video' and 'watch_progress' fields.
"""

from rest_framework import serializers
from .models import PlaybackHistory


class PlaybackHistorySerializer(serializers.ModelSerializer):
    """
    Ties PlaybackHistory the out-of-the-box 'djangorestframework' serializer.

    Inheritance:
    	serializers.ModelSerializer - Base class handling data marshalling.
    """
    pass
