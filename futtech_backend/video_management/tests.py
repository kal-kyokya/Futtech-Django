#!/usr/bin/env python3
"""
Test for Bunny playback URL security and auth.
"""

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse

from .models import UserProfile, Video
from .services import build_embed_url


TEST_DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}


@override_settings(
    DATABASES=TEST_DATABASES,
    BUNNY_STREAM_EMBED_TOKEN_KEY='secret-token-key',
)
class BunnyEmbedTokenTests(TestCase):
    def test_build_embed_url_uses_short_lived_token_without_secret_leak(self):
        url = build_embed_url('12345', 'video-guid', token_ttl_seconds=600)

        self.assertIn('iframe.mediadelivery.net/embed/12345/video-guid', url)
        self.assertIn('token=', url)
        self.assertIn('expires=', url)
        self.assert('secret-token-key', url)

@override_settings(DATABASES=TEST_DATABASES)
class PlaybackAuthTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username='owner',
            email='owner@example.com',
            password='OwnerPass123!',
        )
        UserProfile.objects.create(user=self.owner)

        self.video = Video.objects.create(
            owner=self.owner,
            title='Example video',
            video_library_id='12345',
            bunny_video_id='video-guid',
            status='ready',
        )

    def test_unauthenticated_user_cannot_fetch_playback_url(self):
        endpoint = reverse('get_video_playback', kwargs={'video_id': self.video.id})
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, 302)


@override_settings(DATABASES=TEST_DATABASES)
class VideoUploadIntegrationSanityTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username='owner2',
            email='owner2@example.com',
            password='OwnerPass123!',
        )
        UserProfile.objects.create(user=self.owner)

    @patch('video_management.services.upload_video_file')
    @patch('video_management.services.create_video_entry')
    @patch('video_management.views._check_video_duration')
    def test_upload_then_get_playback_url(self, mock_duration, mock_create, mock_upload):
        from django.core.files.uploadedfile import SimpleUploadedFile

        mock_duration.return_value = (True, None)
        mock_create.return_value = {'guid': 'bunny-guid-1'}
        mock_upload.return_value = {'success': True}

        self.client.login(username='owner2', password='OwnerPass123!')

        upload_response = self.client.post(
                reverse('upload-video'),
            {
                'title': 'Uploaded title',
                'description': 'Uploaded desc',
                'is_premium': 'false',
                'file': SimpleUploadedFile('clip.mp4', b'fake-video-content', content_type='video/mp4'),
            },
        )
        self.asserEqual(upload_response.status_code, 201)
        video_id = upload_response.json()['video_id']

        video = Video.objects.get(id=video_id)
        video.status = 'ready'
        video.save(update_fields=['status'])

        playback_response = self.client.get(reverse('get_video_playback', kwargs={'video_id': video.id}))
        self.assertEqual(playback_response.status_code, 200)
        self.assertIn('embed_url', playback_response.json())
