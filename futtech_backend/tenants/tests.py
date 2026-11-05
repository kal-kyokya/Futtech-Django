from django.test import TestCase, RequestFactory, override_settings
from django.urls import reverse

from .middleware import TenantMiddleware
from .models import Tenant


@override_settings(TENANT_BASE_DOMAIN='example.com', ALLOWED_HOSTS=['*'])
class TenantResolutionTests(TestCase):
    def setUp(self):
        self.alpha = Tenant.objects.create(slug='alpha', name='Alpha FC', primary_color='#112233')
        self.beta = Tenant.objects.create(slug='beta', name='Beta FC', primary_color='#445566')

    def test_each_trusted_host_receives_only_its_tenant_branding(self):
        for host, expected in [('alpha.example.com', self.alpha),
                               ('beta.example.com:8000', self.beta),
                               ('www.alpha.example.com', self.alpha),
                               ('ALPHA.EXAMPLE.COM', self.alpha)]:
            with self.subTest(host=host):
                response = self.client.get(reverse('tenant-current'), HTTP_HOST=host)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()['slug'], expected.slug)
                self.assertEqual(response.json()['name'], expected.name)
                self.assertEqual(response.json()['primary_color'], expected.primary_color)

    def test_untrusted_and_unknown_hosts_do_not_resolve_another_tenant(self):
        for host in ['alpha.attacker.com', 'alpha.example.com.attacker.com',
                     'alpha.evil-example.com', 'alpha.extra.example.com',
                     'unknown.example.com', 'example.com', 'www.example.com']:
            with self.subTest(host=host):
                response = self.client.get(reverse('tenant-current'), HTTP_HOST=host)
                self.assertEqual(response.json()['slug'], 'default')

    def test_ip_addresses_do_not_trigger_tenant_queries(self):
        middleware = TenantMiddleware(lambda request: request)
        for host in ['127.0.0.1:8000', '[::1]:8000']:
            with self.subTest(host=host), self.assertNumQueries(0):
                request = middleware(RequestFactory().get('/', HTTP_HOST=host))
                self.assertIsNone(request.tenant)
                self.assertIsNone(request.tenant_slug)

    @override_settings(TENANT_BASE_DOMAIN='localhost')
    def test_localhost_subdomains_support_local_tenant_development(self):
        response = self.client.get(reverse('tenant-current'), HTTP_HOST='alpha.localhost:8000')
        self.assertEqual(response.json()['slug'], 'alpha')
