#!/usr/bin/env python3
"""
'serializers.py' contains definitions of Serializers for
                 video metadata and public showcase responses.
"""

from rest_framework.serializers import ModelSerializer, SerializerMethodField
from .models import Video
from .services import build_embed_url


class VideoSerializer(ModelSerializer):
    """
    Serializes Video instances for list/detail API responses.
    """

    class Meta:
        model = Video
        exclude = ('updated_at', 'created_at')


class PublicShowcaseVideoSerializer(ModelSerializer):
    embed_url = SerializerMethodField()

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
            'embed_url',
        ]

    def get_embed_url(self, obj):
        if obj.status != 'ready' or not obj.video_library_id or not obj.bunny_video_id:
            return None

        return build_embed_url(obj.video_library_id, obj.bunny_video_id)
