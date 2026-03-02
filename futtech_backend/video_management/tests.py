#!/usr/bin/env python3
"""
Tests for video and payment workflows.
"""

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse

from .models import PaymentProvider, PaymentStatus, PaymentTransaction, UserProfile, Video
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
        self.assertNotIn('secret-token-key', url)


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
        self.assertEqual(upload_response.status_code, 201)
        video_id = upload_response.json()['video_id']

        video = Video.objects.get(id=video_id)
        video.status = 'ready'
        video.save(update_fields=['status'])

        playback_response = self.client.get(reverse('get_video_playback', kwargs={'video_id': video.id}))
        self.assertEqual(playback_response.status_code, 200)
        self.assertIn('embed_url', playback_response.json())


@override_settings(
    DATABASES=TEST_DATABASES,
    MPESA_CALLBACK_URL='https://example.com/api/v2/payments/callback/mpesa',
    PAYMENT_SUBSCRIPTION_DAYS=30,
)
class PaymentFlowTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username='payuser',
            email='pay@example.com',
            password='PayPass123!',
        )
        UserProfile.objects.create(user=self.user)

    def _login(self):
        self.client.login(username='payuser', password='PayPass123!')

    @patch('video_management.views.MpesaClient.initiate_stk_push')
    def test_mpesa_initiate_creates_processing_transaction(self, mock_initiate):
        self._login()
        mock_initiate.return_value = {
            'CheckoutRequestID': 'ws_CO_123',
            'MerchantRequestID': 'mr_123',
            'ResponseCode': '0',
        }

        response = self.client.post(
            reverse('initiate_checkout'),
            data={'provider': 'MPESA', 'phone_number': '0712345678'},
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 202)
        tx = PaymentTransaction.objects.get(id=response.json()['transaction_id'])
        self.assertEqual(tx.provider, PaymentProvider.MPESA)
        self.assertEqual(tx.status, PaymentStatus.PROCESSING)

    def test_invalid_phone_number_is_rejected(self):
        self._login()
        response = self.client.post(
            reverse('initiate_checkout'),
            data={'provider': 'MPESA', 'phone_number': '12345'},
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 400)

    def test_mpesa_callback_success_is_idempotent_and_fulfills(self):
        tx = PaymentTransaction.objects.create(
            user=self.user,
            provider=PaymentProvider.MPESA,
            status=PaymentStatus.PROCESSING,
            amount='1500.00',
            currency='KES',
            purpose='subscription',
            idempotency_key='abc123xyzz',
            provider_checkout_request_id='ws_CO_123',
        )

        payload = {
            'Body': {
                'stkCallback': {
                    'MerchantRequestID': 'mr_123',
                    'CheckoutRequestID': 'ws_CO_123',
                    'ResultCode': 0,
                    'ResultDesc': 'The service request is processed successfully.',
                    'CallbackMetadata': {
                        'Item': [
                            {'Name': 'MpesaReceiptNumber', 'Value': 'QWE123XYZ'},
                        ]
                    }
                }
            }
        }

        response_one = self.client.post(reverse('mpesa_callback'), data=payload, content_type='application/json')

        response_two = self.client.post(reverse('mpesa_callback'), data=payload, content_type='application/json')
        tx.refresh_from_db()
        profile = UserProfile.objects.get(user=self.user)

        self.assertEqual(response_one.status_code, 200)
        self.assertEqual(response_two.status_code, 200)
        self.assertEqual(tx.status, PaymentStatus.SUCCEEDED)
        self.assertInNotNone(tx.fulfilled_at)
        self.assertIsNotNone(profile.access_expires_at)

    def test_mpesa_callback_failed_does_not_fulfill(self):
        tx = PaymentTransaction.objects.create(
            user=self.user,
            provider=PaymentProvider.MPESA,
            status=PaymentStatus.PROCESSING,
            amount='1500.00',
            currency='KES',
            purpose='subscription',
            idempotency_key='abc123xyza',
            provider_checkout_request_id='ws_CO_999',
        )

        payload = {
            'Body': {
                'stkCallback': {
                    'CheckoutRequestID': 'ws_CO_999',
                    'ResultCode': 1032,
                    'ResultDesc': 'Request canceled by user',
                }
            }
        }
        self.client.post(reverse('mpesa_callback'), data=payload, content_type='application/json')
        tx.refresh_from_db()
        profile = UserProfile.objects.get(user=self.user)

        self.assertEqual(tx.status, PaymentStatus.FAILED)
        self.assertIsNone(profile.access_expires_at)

    @patch('video_management.views.process_stripe_event')
    def test_stripe_webhook_endpoint_processes_event(self, mock_process):
        mock_process.return_value = 'checkout.session.completed'
        response = self.client.post(
            reverse('stripe_callback'),
            data='{}',
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE='sig',
        )
        self.assertEqual(response.status_code, 200)

    def test_status_endpoint_requires_ownership(self):
        other_user = get_user_model().objects.create_user(
            username='other',
            email='other@example.com',
            password='OtherPass123!',
        )
        UserProfile.objects.create(user=other_user)

        tx = PaymentTransaction.objects.create(
            user=other_user,
            provider=PaymentProvider.MPESA,
            status=PaymentStatus.PROCESSING,
            amount='1500.00',
            currency='KES',
            purpose='subscription',
            idempotency_key='abc123xyza',
        )

        self._login()
        response = self.client.get(reverse('payment_status', kwargs={'transaction_id': tx.id}))
        self.assertEqual(response.status_code, 404)
