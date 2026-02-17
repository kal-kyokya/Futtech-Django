#!/usr/bin/env python3
"""
'serializers.py' defines a subclass of 'djangorestframework' meant to be
		 attached to the 'PlaybackHistory' model in order to
		 convert every I/O of the 'video' and 'watch_progress' fields.
"""

from rest_framework.serializers import ModelSerializer
from .models import Video, PlaybackHistory


class PlaybackHistorySerializer(ModelSerializer):
    """
    Handles validation and serialization of request data
    aimed at the PlaybackHistory Django model.

    Inheritance:
    	ModelSerializer - Base class for all DRF serializer classes.
    """

    class Meta:
        model = PlaybackHistory
        fields = ['video', 'watch_progress']


class VideoUploadSerializer(ModelSerializer):
    """
    Handles serialization of the data used during the video upload workflow.

    Inheritance:
    	ModelSerializer - Base class for all DRF serializer classes
    			  that directly operate on Django models.
    """

    class Meta:
        """
        Declares the model upon which serialization occur and
        the fields to include in the serialized output.
        """

        model = Video
        fields = ['id', 'title', 'description',
                  'is_premium', 'is_drone', 'is_analysis']


class VideoSerializer(ModelSerializer):
    """
    Serializes Video instances for list/detail API responses.
    """

    class Meta:
        model = Video
        exclude = ('updated_at', 'created_at')


class VideoCreationSerializer(ModelSerializer):
    """
    Handles serialization of data used for video creation.

    Inheritance:
    	ModelSerializer - Base class for all DRF serializer classes.
    """

    class Meta:
        """
        Declares the model upon which serialization occur and
        the fields to include/exclude from the serialized output.
        """

        model = Video

        # Model fields to exclude from the serialized output
        exclude = ('updated_at', 'created_at')
