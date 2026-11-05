from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient


@override_settings(REST_FRAMEWORK={'NUM_PROXIES': 0, 'DEFAULT_THROTTLE_RATES': {
    'login': '2/min', 'registration': '2/min', 'token_refresh': '2/min',
}})
class AuthThrottleTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()

    def test_sensitive_endpoints_limit_anonymous_and_authenticated_callers(self):
        user = get_user_model().objects.create_user(username='throttle-user')
        for authenticated in [False, True]:
            for name in ['user-registration', 'user-login', 'google-sign-in', 'token-refresh']:
                with self.subTest(authenticated=authenticated, endpoint=name):
                    cache.clear()
                    self.client.force_authenticate(user if authenticated else None)
                    endpoint = reverse(name)
                    for _ in range(2):
                        self.assertNotEqual(self.client.post(endpoint, {}, format='json').status_code, 429)
                    response = self.client.post(endpoint, {}, format='json')
                    self.assertEqual(response.status_code, 429)
                    self.assertIn('Retry-After', response)

    def test_registration_budget_is_separate_from_login(self):
        for _ in range(2):
            self.client.post(reverse('user-login'), {}, format='json')
        response = self.client.post(reverse('user-registration'), {}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_untrusted_forwarded_headers_cannot_reset_login_budget(self):
        for address in ['192.0.2.1', '192.0.2.2']:
            self.client.post(reverse('user-login'), {}, format='json', HTTP_X_FORWARDED_FOR=address)
        response = self.client.post(reverse('user-login'), {}, format='json', HTTP_X_FORWARDED_FOR='192.0.2.3')
        self.assertEqual(response.status_code, 429)


from . import tests as auth_tests


@override_settings(GOOGLE_OAUTH_CLIENT_ID='fixture.apps.googleusercontent.com')
class GoogleIdentitySecurityTests(auth_tests.AuthTestBase):
    google_login = auth_tests.GoogleSignInTests.google_login

    def payload(self, **changes):
        return {'iss': 'https://accounts.google.com', 'sub': 'new-google-id',
                'email': 'player@example.com', 'email_verified': True,
                'hd': 'example.com', **changes}

    def test_truthy_email_verified_is_not_accepted(self):
        for value in ['false', 'true', 1]:
            response = self.google_login(self.payload(email_verified=value))
            self.assertEqual(response.status_code, 400)
        self.assertFalse(self.user_model.objects.exists())

    def test_disabled_user_is_not_linked(self):
        user = self.create_user(email='player@example.com', is_active=False)
        response = self.google_login(self.payload())
        self.assertEqual(response.status_code, 401)
        self.assertFalse(user.social_accounts.exists())

    def test_ambiguous_email_is_not_linked(self):
        self.create_user(email='player@example.com', username='first')
        self.create_user(email='PLAYER@example.com', username='second')
        response = self.google_login(self.payload())
        self.assertEqual(response.status_code, 409)
        from .models import SocialAccount
        self.assertFalse(SocialAccount.objects.exists())

    def test_non_authoritative_email_cannot_link_existing_account(self):
        user = self.create_user(email='player@example.com')
        response = self.google_login(self.payload(hd=None))
        self.assertEqual(response.status_code, 409)
        self.assertFalse(user.social_accounts.exists())

    def test_invalid_identity_fields_return_400(self):
        for changes in [{'sub': ['id']}, {'sub': 'x' * 256}, {'email': ['email']}, {'email': 'invalid'}]:
            with self.subTest(changes=changes):
                self.assertEqual(self.google_login(self.payload(**changes)).status_code, 400)

    def test_gmail_identity_can_link_without_hosted_domain(self):
        user = self.create_user(email='player@gmail.com')
        response = self.google_login(self.payload(email='player@gmail.com', hd=None))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['id'], user.pk)


class AuthOriginTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=True)

    def test_untrusted_origins_are_rejected_on_all_cookie_endpoints(self):
        for endpoint in ['user-registration', 'user-login', 'google-sign-in', 'token-refresh', 'user-logout']:
            for origin in ['https://attacker.example', 'null', 'https://testserver.attacker.example',
                           'https://testserver@attacker.example', 'https://[invalid']:
                with self.subTest(endpoint=endpoint, origin=origin):
                    response = self.client.post(reverse(endpoint), {}, format='json', HTTP_ORIGIN=origin)
                    self.assertEqual(response.status_code, 403)

    @override_settings(FRONTEND_URL='https://app.example', CORS_ALLOWED_ORIGINS=['https://other.example'])
    def test_configured_and_same_origins_are_allowed(self):
        for origin in ['http://testserver', 'https://app.example', 'https://other.example']:
            response = self.client.post(reverse('user-logout'), {}, format='json', HTTP_ORIGIN=origin)
            self.assertEqual(response.status_code, 400)

    def test_stale_access_header_does_not_block_public_auth_or_logout(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer expired.invalid.token')
        for endpoint in ['user-registration', 'user-login', 'google-sign-in', 'user-logout']:
            response = self.client.post(reverse(endpoint), {}, format='json')
            self.assertEqual(response.status_code, 400)


class RegistrationValidationTests(auth_tests.AuthTestBase):
    def test_password_similar_to_username_is_rejected(self):
        response = self.register_user({**self.registration_payload,
                                      'username': 'FootballCaptain77',
                                      'password': 'FootballCaptain77', 'passwordConfirm': 'FootballCaptain77'})
        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.data)
        self.assertFalse(self.user_model.objects.exists())

    def test_username_constraints_are_enforced_before_database_write(self):
        for username in ['x' * 151, 'invalid/name']:
            with self.subTest(username=username):
                response = self.register_user({**self.registration_payload, 'username': username})
                self.assertEqual(response.status_code, 400)
                self.assertIn('username', response.data)
        self.assertFalse(self.user_model.objects.exists())

    def test_password_whitespace_is_preserved_on_registration_and_login(self):
        password = '  DistinctStrongPass42!  '
        response = self.register_user({**self.registration_payload,
                                      'password': password, 'passwordConfirm': password})
        self.assertEqual(response.status_code, 201)
        user = self.user_model.objects.get(email=self.registration_payload['email'])
        self.assertTrue(user.check_password(password))
        self.assertFalse(user.check_password(password.strip()))
        self.assertEqual(self.login_user(user.email, password).status_code, 200)
        self.assertEqual(self.login_user(user.email, password.strip()).status_code, 401)


class ProfileIntegrityTests(auth_tests.AuthTestBase):
    def setUp(self):
        super().setUp()
        from video_management.models import UserProfile
        self.user = self.create_user()
        self.profile = UserProfile.objects.create(user=self.user)
        self.client.force_authenticate(self.user)
        self.endpoint = reverse('user-update', kwargs={'user_id': self.user.pk})

    def test_oversized_profile_values_return_field_errors(self):
        for field, value in [('username', 'x' * 151), ('firstName', 'x' * 151),
                             ('lastName', 'x' * 151), ('profession', 'x' * 256),
                             ('phone', '1' * 14), ('location', 'x' * 169),
                             ('profilePic', 'https://example.com/' + 'a' * 512)]:
            with self.subTest(field=field):
                response = self.client.put(self.endpoint, {field: value}, format='json')
                self.assertEqual(response.status_code, 400)
                self.assertIn(field, response.data)

    def test_form_encoded_profile_update_preserves_scalar_values(self):
        response = self.client.put(self.endpoint, {'firstName': 'Ada', 'position': 'Striker', 'sex': 'Female'}, format='multipart')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['firstName'], 'Ada')
        self.assertEqual(response.data['position'], 'striker')
        self.assertEqual(response.data['sex'], 'female')

    def test_profile_failure_rolls_back_user_changes(self):
        from unittest.mock import patch
        from .serializers import UserUpdateSerializer
        from video_management.models import UserProfile
        serializer = UserUpdateSerializer(data={'firstName': 'Changed', 'bio': 'Changed'},
                                          context={'user': self.user, 'profile': self.profile})
        self.assertTrue(serializer.is_valid())
        with patch.object(UserProfile, 'save', side_effect=RuntimeError('write failed')):
            with self.assertRaises(RuntimeError):
                serializer.update(self.user, serializer.validated_data)
        self.user.refresh_from_db()
        self.profile.refresh_from_db()
        self.assertEqual(self.user.first_name, '')
        self.assertIsNone(self.profile.bio)


class TokenLifecycleTests(auth_tests.AuthTestBase):
    def test_duplicate_email_login_returns_401(self):
        self.create_user(email='duplicate@example.com', username='first')
        self.create_user(email='DUPLICATE@example.com', username='second')
        self.assertEqual(self.login_user('duplicate@example.com', self.default_password).status_code, 401)

    def test_deleted_and_inactive_accounts_cannot_refresh(self):
        from rest_framework_simplejwt.tokens import RefreshToken
        for deleted in [True, False]:
            with self.subTest(deleted=deleted):
                user = self.create_user(username=f'user-{deleted}', email=f'{deleted}@example.com')
                token = str(RefreshToken.for_user(user))
                if deleted:
                    user.delete()
                else:
                    user.is_active = False
                    user.save(update_fields=['is_active'])
                response = self.client.post(self.refresh_url, {'refresh': token}, format='json')
                self.assertEqual(response.status_code, 401)
                self.assertNotIn('access', response.data)

    def test_refresh_without_user_claim_is_rejected(self):
        from rest_framework_simplejwt.tokens import RefreshToken
        token = str(RefreshToken())
        response = self.client.post(self.refresh_url, {'refresh': token}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_rotation_blacklists_old_token_and_keeps_new_token_in_cookie_only(self):
        user = self.create_user()
        login = self.login_user(user.email, self.default_password)
        original = login.cookies['refresh_token'].value
        response = self.client.post(self.refresh_url, {'refresh': original}, format='json')
        self.assertEqual(response.status_code, 200)
        rotated = response.cookies['refresh_token'].value
        self.assertNotEqual(original, rotated)
        self.assertNotIn('refresh', response.data)
        self.assertTrue(response.cookies['refresh_token']['httponly'])
        replay = self.client.post(self.refresh_url, {'refresh': original}, format='json')
        self.assertEqual(replay.status_code, 401)
        renewed = self.client.post(self.refresh_url, {'refresh': rotated}, format='json')
        self.assertEqual(renewed.status_code, 200)


class RefreshCookieTransportTests(auth_tests.AuthTestBase):
    def test_cookie_transport_follows_development_and_production_modes(self):
        for debug, secure in [(True, False), (False, True)]:
            with self.subTest(debug=debug), override_settings(DEBUG=debug):
                user = self.create_user(username=f'debug-{debug}', email=f'{debug}@example.com')
                response = self.login_user(user.email, self.default_password)
                self.assertEqual(bool(response.cookies['refresh_token']['secure']), secure)
                self.assertTrue(response.cookies['refresh_token']['httponly'])
                self.assertEqual(response.cookies['refresh_token']['samesite'], 'Lax')


class DevelopmentCorsTests(TestCase):
    def test_local_frontend_can_use_credentials_and_untrusted_origin_cannot(self):
        from futtech_backend.settings import dev
        with override_settings(CORS_ALLOW_ALL_ORIGINS=dev.CORS_ALLOW_ALL_ORIGINS,
                               CORS_ALLOWED_ORIGINS=dev.CORS_ALLOWED_ORIGINS,
                               CORS_ALLOW_CREDENTIALS=dev.CORS_ALLOW_CREDENTIALS):
            response = self.client.options(reverse('user-login'),
                HTTP_ORIGIN='http://localhost:5174', HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST')
            self.assertEqual(response['Access-Control-Allow-Origin'], 'http://localhost:5174')
            self.assertEqual(response['Access-Control-Allow-Credentials'], 'true')
            response = self.client.options(reverse('user-login'),
                HTTP_ORIGIN='https://attacker.example', HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST')
            self.assertNotIn('Access-Control-Allow-Origin', response)
