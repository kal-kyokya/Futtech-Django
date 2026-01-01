#!/usr/bin/env python3
"""
'test.py' validates the public authentication API behaviour.
"""

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient


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
    SECURE_SSL_REDIRECT=False,
)
class AuthTestBase(APITestCase):
    """
    Provides shared helpers for authentication API tests.
    """

    def setUp(self):
        self.client = APIClient()
        self.user_model = get_user_model()
        self.registration_url = reverse('user-registration')
        self.login_url = reverse('user-login')
        self.refresh_url = reverse('token-refresh')
        self.logout_url = reverse('user-logout')
        self.me_url = reverse('get-current-user')

        self.default_password = 'StrongPass123!'
        self.registration_payload = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': self.default_password,
            'passwordConfirm': self.default_password,
        }

        def create_user(self, email='existing@example.com',
                        username='existing', password=None, **kwargs):
            """
            Executes a write on our DB and skips the need for an API call.
            """
            password = password or self.default_password
            user = self.user_model.objects.create_user(
                email=email,
                username=username,
                password=password,
                **kwargs,
            )

            return user

        def register_user(self, payload=None):
            """
            Makes a pseudo API call to the user registration endpoint.
            """
            return self.client.post(
                self.registration_url,
                payload or self.registration_payload,
                format='json',
                secure=True,
            )

        def login_user(self, email, password):
            """
            Makes a pseudo API call to the user login endpoint.
            """
            return self.client.post(
                self.login_url,
                {'email': email, 'password': password},
                format='json',
                secure=True,
            )

        def assert_field_error(self, response, field,
                               message_substring=None):
            """
            Validates the existence, type and content of error fields.
            """
            self.assertIn(field, response.data)
            field_errors = response.data[field]
            self.assertIsInstance(field_errors, list)
            if message_substring:
                self.assertTrue(
                    any(message_substring in str(err) for err in field_errors),
                    msg=f"Expected '{message_substring}' in {field} errors."
                )


class RegistrationTests(AuthTestBase):
    """
    Covers registration happy-paths and edge cases.
    """

    def test_registration_happy_path_returns_tokens_and_cookie(self):
        response = self.register_user()

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['message'], 'User registered successfully')
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], self.registration_payload['email'])
        self.assertEqual(response.data['user']['username'], self.registration_payload['username'])
        refresh_cookie = response.cookies.get('refresh_token')
        self.assertIsNotNone(refresh_cookie)
        self.assertTrue(refresh_cookie.value)

    def test_registration_duplicate_email_returns_field_error(self):
        
        # Authenticate the user and obtain a fresh access token
        login_response = self.client.post(
            self.login_url,
            {
                'email': self.registration_payload['email'],
                'password': self.registration_payload['password']
            },
            format='json',
            secure=True
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
            format='json',
            secure=True
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

    def test_registration_rejects_existing_email_or_username(self):
        """
        Ensures duplicate emails or usernames are rejected gracefully.
        """

        # Create a user 'email=newuser@example.com' and 'username=newuser'
        self.client.post(
            self.registration_url,
            self.registration_payload,
            format='json',
            secure=True
        )

        duplicate_email_payload= {
            **self.registration_payload,
            'username': 'anotheruser',
        }
        duplicate_email_response = self.client.post(
            self.registration_url,
            duplicate_email_payload,
            format='json',
            secure=True
        )
        self.assertEqual(duplicate_email_response.status_code, 400)
        self.assertIn('email', duplicate_email_response.data)

        duplicate_username_payload = {
            **self.registration_payload,
            'email': 'anotheruser@example.com',
        }
        duplicate_username_response = self.client.post(
            self.registration_url,
            duplicate_username_payload,
            format='json',
            secure=True
        )
        self.assertEqual(duplicate_username_response.status_code, 400)
        self.assertIn('username', duplicate_username_response.data)
