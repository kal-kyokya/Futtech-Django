#!/usr/bin/env python3
"""Serializers for playlist endpoints.

Playlist responses embed a trimmed video representation so frontend screens
can render playlist cards/details without extra per-video requests.
"""

from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from .models import Playlist
from video_management.serializers import VideoSerializer


class PlaylistSerializer(serializers.ModelSerializer):
    """
    Handles validation and JSON conversion of request data
    during CRUD operations on the Playlist Model.

    Inheritance:
    	serializers.ModelSerializer - Predefines all procedures enabling
			       	      data confirmation, validation,
			       	      serialization and deserialization.
    """

    # Videos are attached through M2M relations from dedicated endpoints/admin.
    videos = VideoSerializer(many=True,
                             read_only=True)
    owner = serializers.PrimaryKeyRelatedField(read_only=True, default=serializers.CurrentUserDefault())

    class Meta:
        """
        Central place for configuration of the manner in which this serializer
        instance of 'ModelSerializer' interacts with its associated Django
        model.

        Also defines how data is to be presented and handled during/after
        serialization and deserialization.
        """

        model = Playlist
        fields = '__all__'
        extra_kwargs = {
            'owner': {'read_only': True},
        }
        validators = [
            UniqueTogetherValidator(
                queryset=Playlist.objects.all(),
                fields=['owner', 'name'],
                message='You already have a playlist with this name.',
            ),
        ]
