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
        self.assertIn(field, response.fields)
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
        self.create_user(email=self.registration_payload['email'])

        response = self.register_user({
            **self.registration_payload,
            'username': 'anotheruser',
        })

        self.assertEqual(response.status_code, 400)
        self.assert_field_error(response, 'email', 'already exists')

    def test_registration_duplicate_username_returns_field_error(self):
        self.create_user(username=self.registration_payload['username'],
                         email='unique@example.com')

        response = self.register_user({
            **self.registration_payload,
            'email': 'anotheruser@example.com',
        })

        self.assertEqual(response.status_code, 400)
        self.assert_field_error(response, 'username',
                                'already exists')

    def test_registration_missing_password_returns_field_errors(self):
        response = self.register_user({
            'email': 'another@example.com',
            'username': 'missingpassword',
        })

        self.assertEqual(response.status_code, 400)
        self.assert_field_error(response, 'password', 'required')
        self.assert_field_error(response, 'passwordConfirm', 'required')

    def test_registration_weak_password_returns_field_errors(self):
        response = self.register_user({
            **self.registration_payload,
            'password': '12345',
            'passwordConfirm': '12345',
        })

        self.assertEqual(response.status_code, 400)
        self.assert_field_error(response, 'password')

    def test_registration_invalid_json_returns_400(self):
        response = self.client.post(
            self.registration_url,
            data='{"email": "badjson"',
            content_type='application/json',
            secure=True,
        )

        self.assertEqual(response.status_code, 400)


class LoginTests(AuthTestBase):
    """
    Covers login behavior and error handling.
    """

    def test_login_with_valid_credentials_returns_tokens(self):
        user = self.create_user()

        response = self.login_user(user.email, self.default_password)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['message'], 'User logged in successfully')
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['email'], user.email)
        self.assertEqual(response.data['user']['username'], user.username)
        refresh_cookie = response.cookies.get('refresh_token')
        self.assertIsNotNone(refresh_cookie)
        self.assertTrue(refresh_cookie.value)

    def test_login_with_invalid_credentials_returns_401(self):
        user = self.create_user()

        response = self.login_user(user.email, 'WrongPassword!')

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data['detail'], 'Invalid password.')

    def test_login_inactive_user_returns_401(self):
        user = self.create_user(is_active=False)

        response = self.login_user(user.email, self.default_password)

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data['detail'], 'User account is disabled.')

    def test_login_invalid_json_returns_400(self):
        response = self.client.post(
            self.login_url,
            data='{"email": "badjson"',
            content_type='application/json',
            secure=True
        )

        self.assertEqual(response.status_code, 400)


class TokenRefreshTests(AuthTestBase):
    """
    Covers refresh token behavior.
    """

    def test_refresh_with_valid_cookie_returns_new_access(self):
        user = self.create_user()
        login_response = self.login_user(user.email, self.default_password)
        refresh_cookie = login_response.cookies.get('refresh_token')
        self.client.cookies['refresh_token'] = refresh_cookie.value

        response = self.client.post(self.refresh_url, {},
                                    format='json', secure=True)

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertTrue(response.data['access'])

    def test_refresh_with_invalid_token_returns_401(self):
        response = self.client.post(
            self.refresh_url,
            {'refresh': 'invalid.token.value'},
            format='json',
            secure=True
        )

        self.assertEqual(response.status_code, 401)


class LogoutTests(AuthTestBase):
    """
    Covers logout and blacklist behavior.
    """

    def test_logout_blacklists_refresh_token(self):
        user = self.create_user()
        login_response = self.login_user(user.email, self.default_password)
        refresh_cookie = login_response.cookies.get('refresh_token')
        self.client.cookies['refresh_token'] = refresh_cookie.value

        response = self.client.post(self.logout_url, {},
                                    format='json', secure=True)

        self.assertIn(response.status_code, [200, 204])
        logout_cookie = response.cookies.get('refresh_token')
        self.assertIsNotNone(logout_cookie)

        refresh_response = self.client.post(
            self.refresh_url,
            {'refresh': refresh_cookie.value},
            format='json',
            secure=True,
        )

        self.assertEqual(refresh_response.status_code, 401)

    def test_logout_missing_refresh_token_returns_400(self):
        response = self.client.post(self.logout_url, {},
                                    format='json', secure=True)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['detail'], 'Refresh token is required to log out.')


class ProfileTests(AuthTestBase):
    """
    Covers profile retrieval with JWT auth.
    """

    def test_me_requires_authentication(self):
        response = self.client.get(self.me_url, secure=True)

        self.assertEqual(response.status_code, 401)
        self.assertEqual(
            response.data['detail'],
            'Authentication credentials were not provided.'
        )

    def test_me_returns_current_user_profile(self):
        user = self.create_user(email='me@example.com', username='meuser')
        login_response = self.login_user(user.email, self.default_password)
        access_token = login_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.me_url, secure=True)

        self.assertEqual(response.status_code, 200)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user'], user.id)
