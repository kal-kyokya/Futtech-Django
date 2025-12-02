#!/usr/bin/env python3
"""
'test' contains classes verifying the public authentication API behaviour.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient


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
class UserAuthenticationFlowTests(TestCase):
    """
    Ensures the high-level authentication endpoints behave as expected.
    """

    def setUp(self):
        self.client = APIClient()
        self.registration_url = reverse('user-registration')
        self.login_url = reverse('user-login')
        self.refresh_url = reverse('token-refresh')
        self.me_url = reverse('get-current-user')

        self.registration_payload = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'StrongPass123!',
            'passwordConfirm': 'StrongPass123!',
        }

    def test_user_can_register_login_refresh_and_fetch_profile(self):
        """
        Exercises the main authentication endpoints as a single flow.
        """

        # Register a new account and secure tokens plus cookie are returned
        register_response = self.client.post(
            self.registration_url,
            self.registration_payload,
            format='json'
        )
        self.assertEqual(register_response.status_code, 201)
        self.assertIn('access', register_response.data)
        refresh_cookie = register_response.cookies.get('refresh_token')
        self.assertIsNotNone(refresh_cookie)
        self.assertTrue(refresh_cookie.value)

        user_model = get_user_model()
        self.assertTrue(
            user_model.objects.filter(email=self.registration_payload['email']).exists()
        )

        # Authenticate the user and obtain a fresh access token
        login_response = self.client.post(
            self.login_url,
            {
                'email': self.registration_payload['email'],
                'password': self.registration_payload['password']
            },
            format='json'
        )
        self.assertEqual(login_response.status_code, 200)
        login_refresh_cookie = login_response.cookies.get('refresh_token')
        self.assertIsNotNone(login_refresh_cookie)
        self.assertTrue(login_refresh_cookie.value)

        access_token = login_response.data['access']

        # Refresh tokens using the cookie-based fallback
        self.client.cookies['refresh_token'] = login_refresh_cookie.value
        refresh_response = self.client.post(
            self.refresh_url,
            {},
            format='json'
        )
        self.assertEqual(refresh_response.status_code, 200)
        self.assertIn('access', refresh_response.data)

        # Use the latest access token (post-refresh if provided) to call /me/
        final_access_token = refresh_response.data.get('access', access_token)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {final_access_token}'
        )
        me_response = self.client.get(self.me_url)
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(
            me_response.data['email'],
            self.registration_payload['email']
        )
        self.assertEqual(
            me_response.data['username'],
            self.registration_payload['username']
        )
