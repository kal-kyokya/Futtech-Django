#!/usr/bin/env python3
"""
'tests' contains classes validating the playlist API behaviour.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Playlist


TEST_DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

TEST_PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']


@override_settings(
    DATABASES=TEST_DATABASES,
    PASSWORD_HASHERS=TEST_PASSWORD_HASHERS,
    SECRET_KEY='test-secret-key',
)
class PlaylistViewSetTests(TestCase):
    """
    Ensures the playlist endpoints expose the expected behaviour.
    """

    def setUp(self):
        self.client = APIClient()
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username='owner',
            email='owner@example.com',
            password='OwnerPass123!',
        )
        self.other_user = user_model.objects.create_user(
            username='other',
            email='other@example.com',
            password='OtherPass123!',
        )

        self.owner_playlist = Playlist.objects.create(
            name='Owner playlist',
            owner=self.owner,
            is_public=False,
        )
        self.public_playlist = Playlist.objects.create(
            name='Shared playlist',
            owner=self.other_user,
            is_public=True,
        )
        self.hidden_playlist = Playlist.objects.create(
            name='Hidden playlist',
            owner=self.other_user,
            is_public=False,
        )

    def test_list_returns_owned_and_public_playlists(self):
        """
        The listing endpoint should combine owned and public playlists.
        """

        self.client.force_authenticate(user=self.owner)
        response = self.client.get(reverse('playlist-list'))
        self.assertEqual(response.status_code, 200)

        results = response.data['results']
        playlist_names = {item['name'] for item in results}

        self.assertIn(self.owner_playlist.name, playlist_names)
        self.assertIn(self.public_playlist.name, playlist_names)
        self.assertNotIn(self.hidden_playlist.name, playlist_names)

    def test_create_playlist_assigns_owner(self):
        """
        Creating a playlist should automatically attach the request user.
        """

        self.client.force_authenticate(user=self.owner)
        payload = {
            'name': 'Fresh playlist',
            'description': 'Filled automatically',
            'is_public': True,
        }
        response = self.client.post(reverse('playlist-list'),
                                    payload,
                                    format='json')
        self.assertEqual(response.status_code, 201)

        playlist = Playlist.objects.get(name='Fresh playlist')
        self.assertEqual(playlist.owner, self.owner)
        self.assertTrue(playlist.is_public)
