#!/usr/bin/env python3
"""
Tests for video and payment workflows.
"""

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

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
class PublicShowcaseAccessTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username='showcase-owner',
            email='showcase-owner@example.com',
            password='OwnerPass123!',
        )
        UserProfile.objects.create(user=self.owner)

        self.public_video = Video.objects.create(
            owner=self.owner,
            title='Admissions Showcase Clip',
            description='Public sample for visitors.',
            status='ready',
            is_showcase=True,
            video_library_id='12345',
            bunny_video_id='public-guid-1',
        )
        self.private_video = Video.objects.create(
            owner=self.owner,
            title='Private Team Review',
            description='Should remain hidden',
            status='ready',
            is_showcase=False,
            video_library_id='12345',
            bunny_video_id='private-guid-2',
        )

    def test_anon_can_list_showcase_videos_only(self):
        response = self.client.get(reverse('public_showcase'))

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload), 1)
        self.assertEqual(payload[0]['slug'], self.public_video.slug)
        self.assertIn('embed_url', payload[0])

    def test_anon_can_view_public_showcase_detail(self):
        response = self.client.get(
            reverse('public_showcase_detail',
                    kwargs={'slug': self.public_video.slug})
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload['slug'], self.public_video.slug)
        self.assertEqual(payload['title'], self.public_video.title)

    def test_anon_cannot_view_non_showcase_detail(self):
        response = self.client.get(
            reverse('public_showcase_detail',
                    kwargs={'slug': self.private_video.slug})
        )

        self.assertEqual(response.status_code, 404)


@override_settings(DATABASES=TEST_DATABASES)
class ManualVideoPlaybackTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username='owner2',
            email='owner2@example.com',
            password='OwnerPass123!',
        )
        UserProfile.objects.create(user=self.owner)

    def test_admin_managed_video_can_return_playback_url(self):
        video = Video.objects.create(
            owner=self.owner,
            title='Manually managed Bunny video',
            description='Created through Django admin/back office workflow',
            status='ready',
            video_library_id='12345',
            bunny_video_id='bunny-guid-1',
        )

        self.client.login(username='owner2', password='OwnerPass123!')

        response = self.client.get(reverse('get_video_playback', kwargs={'video_id': video.id}))
        self.assertEqual(response.status_code, 200)
        self.assertIn('embed_url', response.json())
        self.assertIn('bunny-guid-1', response.json()['embed_url'])

    def test_admin_managed_video_can_return_data_by_slug(self):
        video = Video.objects.create(
            owner=self.owner,
            title='Slug routed team video',
            description='Created through Django admin/back office workflow'
            status='ready',
            video_library_id='12345',
            bunny_video_id='bunny-guid-slug',
        )

        self.client.login(username='owner2', password='OwnerPass1234!')

        response = self.client.get(reverse('get_video_data_by_slug', kwargs={'slug': video.slug}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['slug'], video.slug)

    def test_admin_managed_video_can_return_playback_url_by_slug(self):
        video = Video.objects.create(
            owner=self.owner,
            title='Slug managed Bunny video',
            description='Created through Django admin/back office workflow'
            status='ready',
            video_library_id='12345',
            bunny_video_id='bunny-guid-slug-playback',
        )

        self.client.login(username='owner2', password='OwnerPass1234!')

        response = self.client.get(reverse('get_video_playback_by_slug', kwargs={'slug': video.slug}))
        self.assertEqual(response.status_code, 200)
        self.assertIn('embed_url', response.json())
        self.assertIn('bunny-guid-slug-playback', response.json()['embed_url'])

    def test_video_slug_is_generated_for_manual_admin_records(self):
        video = Video.objects.create(
            owner=self.owner,
            title='Manually Managed Highlight',
            status='ready',
            video_library_id='12345',
            bunny_video_id='bunny-guid-2',
        )

        self.assertEqual(video.slug, 'manually-managed-highlight')


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
        self.client.force_authenticate(user=self.user)

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
            format='json',
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
            format='json',
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

        response_one = self.client.post(reverse('mpesa_callback'), data=payload, format='json')

        response_two = self.client.post(reverse('mpesa_callback'), data=payload, format='json')
        tx.refresh_from_db()
        profile = UserProfile.objects.get(user=self.user)

        self.assertEqual(response_one.status_code, 200)
        self.assertEqual(response_two.status_code, 200)
        self.assertEqual(tx.status, PaymentStatus.SUCCEEDED)
        self.assertIsNotNone(tx.fulfilled_at)
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
        self.client.post(reverse('mpesa_callback'), data=payload, format='json')
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
