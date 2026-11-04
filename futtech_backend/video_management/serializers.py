#!/usr/bin/env python3
"""
'serializers.py' contains definitions of Serializers for
                 video metadata and public showcase responses.
"""

from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from .models import Video, PaymentProvider
from .payment_services import normalize_kenyan_phone
from .services import build_embed_url


class CheckoutRequestSerializer(serializers.Serializer):
    provider = serializers.CharField(max_length=20)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=32)

    def validate_provider(self, value):
        provider = value.upper()
        if provider not in PaymentProvider.values:
            raise serializers.ValidationError('Unsupported payment provider.')
        return provider

    def validate(self, attrs):
        if attrs['provider'] == PaymentProvider.MPESA:
            try:
                attrs['phone_number'] = normalize_kenyan_phone(attrs.get('phone_number', ''))
            except ValueError as error:
                raise serializers.ValidationError({'phone_number': str(error)}) from None
        return attrs


class VideoSerializer(ModelSerializer):
    """
    Serializes Video instances for list/detail API responses.
    """

    class Meta:
        model = Video
        fields = [
            'id', 'slug', 'owner', 'title', 'description', 'status',
            'duration_seconds', 'is_premium', 'is_showcase', 'is_drone',
            'is_analysis', 'location', 'category', 'recorded_on', 'thumbnail',
        ]


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


class PublicShowcaseDetailSerializer(PublicShowcaseVideoSerializer):
    embed_url = SerializerMethodField()

    class Meta(PublicShowcaseVideoSerializer.Meta):
        fields = PublicShowcaseVideoSerializer.Meta.fields + ['embed_url']

    def get_embed_url(self, obj):
        if obj.status != 'ready' or not obj.video_library_id or not obj.bunny_video_id:
            return None

        return build_embed_url(obj.video_library_id, obj.bunny_video_id)
