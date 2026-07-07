#!/usr/bin/env python3
"""
'serializers.py' contains definitions of Serializers for
                 video metadata and public showcase responses.
"""

from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from .models import Video


class VideoSerializer(ModelSerializer):
    """
    Serializes Video instances for list/detail API responses.
    """

    class Meta:
        model = Video
        exclude = ('updated_at', 'created_at')


class PublicShowcaseVideoSerializer(ModelSerializer):

    class Meta:
        model = Video
        fields = [
            'id',
            'slug',
            'title',
            'description',
            'thumbnail',
            'location',
            'recorded_on',
            'duration_seconds',
            'category',
            'is_drone',
            'is_analysis',
        ]
