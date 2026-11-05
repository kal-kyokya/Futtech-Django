from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from .models import PaymentProvider, PaymentStatus, PaymentTransaction, UserProfile


class BillingConfirmationTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='payer')
        UserProfile.objects.create(user=self.user)
        self.client.force_login(self.user)
        self.payment = PaymentTransaction.objects.create(
            user=self.user, provider=PaymentProvider.STRIPE, amount='15',
            currency='USD', idempotency_key='billing-test',
            provider_transaction_id='cs_owned',
        )
        self.session = {
            'client_reference_id': str(self.user.pk), 'status': 'complete',
            'payment_status': 'paid', 'customer': 'cus_private',
        }

    @patch('video_management.views.Customer.objects.filter')
    @patch('video_management.views.stripe.checkout.Session.retrieve')
    def test_rejects_foreign_unpaid_and_unrecorded_sessions(self, retrieve, customers):
        for changes, session_id in [
            ({'client_reference_id': 'another-user'}, 'cs_owned'),
            ({'payment_status': 'unpaid'}, 'cs_owned'),
            ({'status': 'open'}, 'cs_owned'),
            ({}, 'cs_unrecorded'),
        ]:
            with self.subTest(changes=changes, session_id=session_id):
                retrieve.return_value = {**self.session, **changes}
                response = self.client.get(reverse('get_subscription_confirmation'), {'session_id': session_id})
                self.assertEqual(response.status_code, 403)
        customers.assert_not_called()
        self.assertIsNone(UserProfile.objects.get(user=self.user).customer_id)

    @patch('video_management.views.Customer.objects.filter')
    @patch('video_management.views.stripe.checkout.Session.retrieve')
    def test_accepts_owned_paid_checkout(self, retrieve, customers):
        retrieve.return_value = self.session
        customers.return_value.first.return_value = None
        response = self.client.get(reverse('get_subscription_confirmation'), {'session_id': 'cs_owned'})
        self.assertEqual(response.status_code, 200)
        customers.assert_called_once_with(id='cus_private')


class MpesaVerificationTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='mpesa-payer')
        UserProfile.objects.create(user=self.user)
        self.payment = PaymentTransaction.objects.create(
            user=self.user, provider=PaymentProvider.MPESA, amount='1500',
            currency='KES', idempotency_key='mpesa-test',
            status=PaymentStatus.PROCESSING, provider_checkout_request_id='checkout-1',
        )
        self.payload = {'Body': {'stkCallback': {'CheckoutRequestID': 'checkout-1', 'ResultCode': 0}}}

    @patch('video_management.views.MpesaClient.query_stk_status')
    def test_forged_success_does_not_grant_access(self, query):
        for verified in [
            {'CheckoutRequestID': 'checkout-1', 'ResultCode': 1032},
            {'CheckoutRequestID': 'another-checkout', 'ResultCode': 0},
            {}, None,
        ]:
            with self.subTest(verified=verified):
                query.return_value = verified
                response = self.client.post(reverse('mpesa_callback'), self.payload, content_type='application/json')
                self.assertEqual(response.status_code, 400)
                self.payment.refresh_from_db()
                self.assertEqual(self.payment.status, PaymentStatus.PROCESSING)
                self.assertIsNone(self.payment.fulfilled_at)
        self.assertIsNone(UserProfile.objects.get(user=self.user).access_expires_at)

    @patch('video_management.views.MpesaClient.query_stk_status', side_effect=TimeoutError)
    def test_provider_outage_fails_closed_and_allows_retry(self, query):
        response = self.client.post(reverse('mpesa_callback'), self.payload, content_type='application/json')
        self.assertEqual(response.status_code, 503)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.PROCESSING)

    def test_malformed_callbacks_return_400(self):
        for payload in [{}, {'Body': None}, {'Body': {'stkCallback': []}},
                        {'Body': {'stkCallback': {'CheckoutRequestID': 'checkout-1', 'ResultCode': 0,
                                                'CallbackMetadata': {'Item': [None]}}}}]:
            with self.subTest(payload=payload):
                response = self.client.post(reverse('mpesa_callback'), payload, content_type='application/json')
                self.assertEqual(response.status_code, 400)

    @patch('video_management.payment_services.requests.post')
    @patch('video_management.payment_services.MpesaClient.get_access_token', return_value='test-token')
    def test_status_query_uses_authenticated_daraja_request(self, token, post):
        from .payment_services import MpesaClient
        post.return_value.json.return_value = {'CheckoutRequestID': 'checkout-1', 'ResultCode': 0}
        self.assertEqual(MpesaClient().query_stk_status('checkout-1')['ResultCode'], 0)
        kwargs = post.call_args.kwargs
        self.assertEqual(kwargs['headers']['Authorization'], 'Bearer test-token')
        self.assertEqual(kwargs['json']['CheckoutRequestID'], 'checkout-1')
        self.assertEqual(kwargs['timeout'], 30)
        post.return_value.raise_for_status.assert_called_once()


class StripeSettlementTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='stripe-payer')
        UserProfile.objects.create(user=self.user)
        self.payment = PaymentTransaction.objects.create(
            user=self.user, provider=PaymentProvider.STRIPE, amount='15',
            currency='USD', idempotency_key='stripe-test',
            status=PaymentStatus.PROCESSING, provider_transaction_id='cs_owned',
        )
        self.checkout = {
            'id': 'cs_owned', 'client_reference_id': str(self.user.pk),
            'payment_status': 'paid', 'amount_total': 1500, 'currency': 'usd',
            'metadata': {'payment_transaction_id': str(self.payment.pk)},
            'subscription': 'sub_owned', 'customer': 'cus_owned',
        }

    def process(self, obj, event_type='checkout.session.completed'):
        from django.test import override_settings
        from .payment_services import process_stripe_event
        event = {'type': event_type, 'data': {'object': obj}}
        with override_settings(DJSTRIPE_WEBHOOK_SECRET='whsec_fixture'), patch(
            'video_management.payment_services.stripe.Webhook.construct_event', return_value=event
        ):
            return process_stripe_event(b'{}', 'signature')

    def test_unpaid_checkout_does_not_fulfill(self):
        self.process({**self.checkout, 'payment_status': 'unpaid'})
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.PROCESSING)
        self.assertIsNone(self.payment.fulfilled_at)

    def test_mismatched_settlements_cannot_fulfill(self):
        for changes in [{'id': 'cs_foreign'}, {'client_reference_id': 'other'},
                        {'amount_total': 1}, {'currency': 'kes'}]:
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                self.process({**self.checkout, **changes})
        self.payment.refresh_from_db()
        self.assertIsNone(self.payment.fulfilled_at)

    def test_paid_checkout_fulfills_once_and_preserves_session_binding(self):
        self.process(self.checkout)
        expiry = UserProfile.objects.get(user=self.user).access_expires_at
        self.process(self.checkout, 'checkout.session.async_payment_succeeded')
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.SUCCEEDED)
        self.assertEqual(self.payment.provider_transaction_id, 'cs_owned')
        self.assertEqual(UserProfile.objects.get(user=self.user).access_expires_at, expiry)
        self.assertEqual(self.payment.metadata['stripe_subscription_id'], 'sub_owned')

    def test_unrelated_invoice_cannot_fulfill(self):
        invoice = {'lines': {'data': [{'metadata': self.checkout['metadata']}]},
                   'subscription': 'sub_foreign', 'customer': 'cus_foreign',
                   'paid': True, 'amount_paid': 1500, 'currency': 'usd'}
        with self.assertRaises(ValueError):
            self.process(invoice, 'invoice.paid')
        self.payment.refresh_from_db()
        self.assertIsNone(self.payment.fulfilled_at)

    def test_empty_invoice_and_invalid_metadata_are_ignored(self):
        self.assertEqual(self.process({'lines': {'data': []}}, 'invoice.paid'), 'invoice.paid')
        self.process({**self.checkout, 'metadata': {'payment_transaction_id': 'not-a-uuid'}})
        self.payment.refresh_from_db()
        self.assertIsNone(self.payment.fulfilled_at)

    def test_missing_webhook_secret_fails_closed(self):
        from django.test import override_settings
        from .payment_services import process_stripe_event
        with override_settings(DJSTRIPE_WEBHOOK_SECRET=''), self.assertRaises(ValueError):
            process_stripe_event(b'{}', 'signature')

    @patch('video_management.payment_services.stripe.checkout.Session.create')
    def test_checkout_uses_provider_idempotency_and_subscription_metadata(self, create):
        from django.test import override_settings, RequestFactory
        from .payment_services import create_stripe_checkout_session
        create.return_value.id = 'cs_owned'
        with override_settings(STRIPE_FALLBACK_PRICE_ID='price_fixture'):
            create_stripe_checkout_session(self.payment, RequestFactory().get('/'))
        self.assertEqual(create.call_args.kwargs['idempotency_key'], self.payment.idempotency_key)
        self.assertEqual(create.call_args.kwargs['subscription_data']['metadata']['payment_transaction_id'], str(self.payment.pk))

    def test_real_webhook_signature_verification(self):
        import hashlib
        import hmac
        import json
        import time
        from django.test import override_settings
        from .payment_services import process_stripe_event
        import stripe

        payload = json.dumps({'type': 'checkout.session.completed', 'data': {'object': self.checkout}}).encode()
        timestamp = str(int(time.time()))
        digest = hmac.new(b'whsec_fixture', timestamp.encode() + b'.' + payload, hashlib.sha256).hexdigest()
        signature = f't={timestamp},v1={digest}'
        with override_settings(DJSTRIPE_WEBHOOK_SECRET='whsec_fixture'):
            with self.assertRaises(stripe.SignatureVerificationError):
                process_stripe_event(payload + b' ', signature)
            self.payment.refresh_from_db()
            self.assertIsNone(self.payment.fulfilled_at)
            process_stripe_event(payload, signature)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.SUCCEEDED)


class PaymentIdempotencyTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='duplicate-payer')
        self.payment = PaymentTransaction.objects.create(
            user=self.user, provider=PaymentProvider.MPESA, amount='1500',
            idempotency_key='duplicate-test', status=PaymentStatus.PROCESSING,
        )

    def test_stale_success_callbacks_fulfill_only_once(self):
        from .payment_services import mark_payment_result
        stale = PaymentTransaction.objects.get(pk=self.payment.pk)
        result = mark_payment_result(self.payment, PaymentStatus.SUCCEEDED)
        self.assertIsNotNone(result.fulfilled_at)
        expiry = UserProfile.objects.get(user=self.user).access_expires_at
        mark_payment_result(stale, PaymentStatus.SUCCEEDED)
        self.assertEqual(UserProfile.objects.get(user=self.user).access_expires_at, expiry)

    def test_late_failure_cannot_downgrade_success(self):
        from .payment_services import mark_payment_result
        mark_payment_result(self.payment, PaymentStatus.SUCCEEDED)
        mark_payment_result(self.payment, PaymentStatus.FAILED, error_message='late callback')
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.SUCCEEDED)
        self.assertEqual(self.payment.error_message, '')

    def test_direct_fulfillment_requires_success_and_is_idempotent(self):
        from .payment_services import fulfill_transaction, mark_payment_result
        fulfill_transaction(self.payment)
        self.assertFalse(UserProfile.objects.filter(user=self.user).exists())
        mark_payment_result(self.payment, PaymentStatus.SUCCEEDED)
        expiry = UserProfile.objects.get(user=self.user).access_expires_at
        fulfill_transaction(self.payment)
        self.assertEqual(UserProfile.objects.get(user=self.user).access_expires_at, expiry)

    def test_fulfillment_failure_rolls_back_payment_state(self):
        from .payment_services import mark_payment_result
        with patch('video_management.payment_services.fulfill_transaction', side_effect=RuntimeError):
            with self.assertRaises(RuntimeError):
                mark_payment_result(self.payment, PaymentStatus.SUCCEEDED)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.PROCESSING)


class ShowcaseBoundaryTests(TestCase):
    def setUp(self):
        from .models import Video
        self.user = get_user_model().objects.create_user(username='showcase-owner')
        self.public = Video.objects.create(owner=self.user, title='Public sample', is_showcase=True,
                                           status='ready', video_library_id='library', bunny_video_id='public-id')
        self.premium = Video.objects.create(owner=self.user, title='Premium sample', is_showcase=True,
                                            is_premium=True, status='ready', video_library_id='library', bunny_video_id='premium-id')
        self.processing = Video.objects.create(owner=self.user, title='Unready sample', is_showcase=True, status='uploading')

    def test_listing_excludes_premium_and_unready_content_and_playback_tokens(self):
        response = self.client.get(reverse('public_showcase'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['slug'] for item in response.json()], [self.public.slug])
        self.assertNotIn('embed_url', response.json()[0])
        self.assertNotIn('bunny_video_id', response.json()[0])

    def test_premium_showcase_detail_is_not_public(self):
        response = self.client.get(reverse('public_showcase_detail', kwargs={'slug': self.premium.slug}))
        self.assertEqual(response.status_code, 404)

    def test_public_detail_retains_playback(self):
        response = self.client.get(reverse('public_showcase_detail', kwargs={'slug': self.public.slug}))
        self.assertEqual(response.status_code, 200)
        self.assertIn('/library/public-id', response.json()['embed_url'])


class VideoMetadataTests(TestCase):
    def test_metadata_uses_explicit_fields_without_provider_identifiers(self):
        from .models import Video
        from .serializers import VideoSerializer
        user = get_user_model().objects.create_user(username='video-owner')
        video = Video.objects.create(owner=user, title='Training clip', status='ready',
                                     video_library_id='private-library', bunny_video_id='private-asset')
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user)
        for endpoint in [reverse('featured_videos'), reverse('get_video_data', kwargs={'video_id': video.pk})]:
            response = client.get(endpoint)
            self.assertEqual(response.status_code, 200)
            self.assertNotIn('private-library', response.content.decode())
            self.assertNotIn('private-asset', response.content.decode())
        self.assertEqual(set(VideoSerializer(video).data), {
            'id', 'slug', 'owner', 'title', 'description', 'status', 'duration_seconds',
            'is_premium', 'is_showcase', 'is_drone', 'is_analysis', 'location', 'category',
            'recorded_on', 'thumbnail',
        })


class CheckoutValidationTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        from rest_framework.test import APIClient
        cache.clear()
        self.user = get_user_model().objects.create_user(username='checkout-user')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_invalid_input_never_creates_a_payment(self):
        for data in [{'provider': []}, {'provider': 'unknown'},
                     {'provider': 'MPESA', 'phone_number': {}},
                     {'provider': 'MPESA', 'phone_number': 'letters0712345678'},
                     {'provider': 'MPESA', 'phone_number': '０７１２３４５６７８'}]:
            with self.subTest(data=data):
                response = self.client.post(reverse('initiate_checkout'), data, format='json')
                self.assertEqual(response.status_code, 400)
        self.assertFalse(PaymentTransaction.objects.exists())

    def test_bad_configuration_does_not_leave_pending_payments(self):
        from django.test import override_settings
        cases = [({'MPESA_CALLBACK_URL': ''}, 'MPESA'),
                 ({'STRIPE_FALLBACK_PRICE_ID': ''}, 'STRIPE'),
                 ({'PAYMENT_SUBSCRIPTION_PRICE_KES': 'NaN'}, 'MPESA'),
                 ({'PAYMENT_SUBSCRIPTION_PRICE_KES': '-1'}, 'MPESA'),
                 ({'PAYMENT_SUBSCRIPTION_PRICE_KES': '1500.50'}, 'MPESA'),
                 ({'PAYMENT_SUBSCRIPTION_PRICE_USD': '15.001'}, 'STRIPE')]
        for settings, provider in cases:
            with self.subTest(settings=settings), override_settings(**settings):
                response = self.client.post(reverse('initiate_checkout'),
                                            {'provider': provider, 'phone_number': '0712345678'}, format='json')
                self.assertEqual(response.status_code, 503)
        self.assertFalse(PaymentTransaction.objects.exists())

    @patch('video_management.views.MpesaClient.initiate_stk_push')
    def test_rejected_provider_response_marks_payment_failed(self, initiate):
        from django.test import override_settings
        for payload in [{'ResponseCode': '1'}, {'ResponseCode': '0'}]:
            with self.subTest(payload=payload), override_settings(MPESA_CALLBACK_URL='https://example.com/callback'):
                initiate.return_value = payload
                response = self.client.post(reverse('initiate_checkout'),
                                            {'provider': 'mpesa', 'phone_number': '0112345678'}, format='json')
                self.assertEqual(response.status_code, 502)
        self.assertEqual(PaymentTransaction.objects.filter(status=PaymentStatus.FAILED).count(), 2)

    def test_phone_formats_and_price_validation(self):
        from django.test import override_settings
        from django.core.exceptions import ImproperlyConfigured
        from .payment_services import normalize_kenyan_phone, get_checkout_price
        for value in ['+254 712-345-678', '0712345678', '712345678']:
            self.assertEqual(normalize_kenyan_phone(value), '254712345678')
        self.assertEqual(normalize_kenyan_phone('0112345678'), '254112345678')
        with override_settings(PAYMENT_SUBSCRIPTION_PRICE_USD='25.50'):
            self.assertEqual(str(get_checkout_price(PaymentProvider.STRIPE)[0]), '25.50')
        for value in ['Infinity', '0', '-1', '100000000', 'invalid', '1.001']:
            with self.subTest(value=value), override_settings(PAYMENT_SUBSCRIPTION_PRICE_USD=value):
                with self.assertRaises(ImproperlyConfigured):
                    get_checkout_price(PaymentProvider.STRIPE)


class PlaybackReadinessTests(TestCase):
    def setUp(self):
        from .models import Video
        from rest_framework.test import APIClient
        self.user = get_user_model().objects.create_user(username='processing-owner')
        self.video = Video.objects.create(owner=self.user, title='Processing', status='processing',
                                          video_library_id='library', bunny_video_id='asset')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    @patch('video_management.views.services.build_embed_url')
    @patch('video_management.views.services.refresh_video_status')
    def test_unready_or_failed_sync_does_not_issue_playback_token(self, refresh, embed):
        for effect in [None, TimeoutError('provider unavailable')]:
            with self.subTest(effect=effect):
                refresh.side_effect = effect
                response = self.client.get(reverse('get_video_playback', kwargs={'video_id': self.video.pk}))
                self.assertEqual(response.status_code, 409)
                self.assertNotIn('embed_url', response.json())
        embed.assert_not_called()

    @patch('video_management.services.requests.get')
    def test_transcoding_status_remains_processing(self, get):
        from .services import refresh_video_status
        for status in [2, 3]:
            get.return_value.json.return_value = {'status': status}
            refresh_video_status(self.video)
            self.video.refresh_from_db()
            self.assertEqual(self.video.status, 'processing')

    @patch('video_management.services.requests.get')
    def test_successful_sync_allows_playback(self, get):
        get.return_value.json.return_value = {'status': 4, 'length': 15}
        response = self.client.get(reverse('get_video_playback', kwargs={'video_id': self.video.pk}))
        self.assertEqual(response.status_code, 200)
        self.assertIn('/library/asset', response.json()['embed_url'])
        self.video.refresh_from_db()
        self.assertEqual(self.video.duration_seconds, 15)


class SubscriptionGraceTests(TestCase):
    def test_missing_or_invalid_period_end_denies_access_without_crashing(self):
        from djstripe.models import Subscription
        for value in [None, 'invalid', 10**100]:
            with self.subTest(value=value):
                profile = UserProfile(subscription=Subscription(id='sub_fixture', stripe_data={
                    'status': 'past_due', 'current_period_end': value,
                }))
                self.assertFalse(profile.has_active_subscription())

    def test_grace_period_ends_at_exactly_ten_days(self):
        import datetime
        from django.utils import timezone
        from djstripe.models import Subscription
        now = timezone.now()
        for delta, expected in [(datetime.timedelta(days=9), True),
                                (datetime.timedelta(days=10, seconds=1), False)]:
            with self.subTest(delta=delta):
                profile = UserProfile(subscription=Subscription(id='sub_fixture', stripe_data={
                    'status': 'past_due', 'current_period_end': (now - delta).timestamp(),
                }))
                with patch('video_management.models.timezone.now', return_value=now):
                    self.assertEqual(profile.has_active_subscription(), expected)
