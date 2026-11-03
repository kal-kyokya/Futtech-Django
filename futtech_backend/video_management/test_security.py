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
