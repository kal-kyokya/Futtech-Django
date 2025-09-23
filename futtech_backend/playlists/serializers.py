#!/usr/bin/env python3
"""
'serializers.py' contains definition of the serializer object to be
		 attached to the 'Playlist' Django model.
"""

from rest_framework import serializers
from .models import Playlist
from video_management.models import Video


class VideoSerializer(serializers.ModelSerializer):
    """
    Handles validation and JSON conversion of request(ed) data
    during CRUD operations on the Video Model.

    Inheritance:
    	serializers.ModelSerializer - Predefines confirmation,
    	validation, serialization and deserialization procedures.
    """

    class Meta:
        """
        Central place for configuration of the manner in which this serializer
        instance of 'ModelSerializer' interacts with its associated Django
        model.

        Also defines how data is to be presented and handled during/after
        serialization and deserialization.
        """

        # Django model upon which this serializer primarily acts
        model = Video

        # Model fields to exclude from the serialized output
        exclude = ('mux_asset_id', 'mux_playback_id',
                   'mux_playback_policy', 'created_at',
                   'updated_at',)


class PlaylistSerializer(serializers.ModelSerializer):
    """
    Handles validation and JSON conversion of request(ed) data
    during CRUD operations on the Playlist Model.

    Inheritance:
    	serializers.ModelSerializer - Predefines confirmation,
    	validation, serialization and deserialization procedures.
    """

    videos = VideoSerializer(many=True,
                             read_only=True)

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
