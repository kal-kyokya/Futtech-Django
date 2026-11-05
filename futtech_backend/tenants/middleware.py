from ipaddress import ip_address
from urllib.parse import urlsplit

from django.conf import settings

from .models import Tenant


class TenantMiddleware:
    """Attach the resolved tenant to each request based on host subdomain."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = (urlsplit('//' + request.get_host()).hostname or '').lower().rstrip('.')
        subdomain = self._tenant_slug(host)

        tenant = None
        if subdomain:
            tenant = Tenant.objects.filter(slug=subdomain).first()

        request.tenant = tenant
        request.tenant_slug = subdomain

        return self.get_response(request)

    @staticmethod
    def _tenant_slug(host):
        try:
            ip_address(host)
            return None
        except ValueError:
            pass
        base = getattr(settings, 'TENANT_BASE_DOMAIN', 'localhost').lower().strip('.')
        if not base or not host.endswith('.' + base):
            return None
        labels = host[:-(len(base) + 1)].split('.')
        if len(labels) == 2 and labels[0] == 'www':
            labels = labels[1:]
        return labels[0] if len(labels) == 1 and labels[0] != 'www' else None
