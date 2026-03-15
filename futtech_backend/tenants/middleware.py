from .models import Tenant


class TenantMiddleware:
    """Attach the resolved tenant to each request based on host subdomain."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(':')[0].lower()
        labels = [label for label in host.split('.') if label]

        subdomain = None
        if len(labels) > 2:
            subdomain = labels[1] if labels[0] == 'www' and len(labels) > 3 else labels[0]

        tenant = None
        if subdomain:
            tenant = Tenant.objects.filter(slug=subdomain).first()

        request.tenant = tenant
        request.tenant_slug = subdomain

        return self.get_response(request)
