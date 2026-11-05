"""Browser-origin protection for endpoints that issue or consume auth cookies."""

from urllib.parse import urlsplit

from django.conf import settings
from django.utils.http import is_same_domain
from rest_framework.exceptions import PermissionDenied


class AuthOriginMixin:
    # Login and logout must work even if the browser has an expired access token.
    authentication_classes = ()

    def get_authenticate_header(self, request):
        return 'Bearer realm="api"'

    def initial(self, request, *args, **kwargs):
        origin = request.headers.get('Origin')
        if origin is not None and request.method not in {'GET', 'HEAD', 'OPTIONS'}:
            trusted = [
                request.build_absolute_uri('/').rstrip('/'),
                getattr(settings, 'FRONTEND_URL', ''),
                *getattr(settings, 'CORS_ALLOWED_ORIGINS', []),
                *getattr(settings, 'CSRF_TRUSTED_ORIGINS', []),
            ]
            try:
                parsed = urlsplit(origin)
            except ValueError:
                raise PermissionDenied('Invalid authentication request origin.') from None
            valid = (
                parsed.scheme in {'http', 'https'} and bool(parsed.netloc)
                and not parsed.username and not parsed.password
                and not parsed.path and not parsed.query and not parsed.fragment
            )
            if not valid or not any(self._matches_origin(parsed, value) for value in trusted if value):
                raise PermissionDenied('Untrusted authentication request origin.')
        return super().initial(request, *args, **kwargs)

    @staticmethod
    def _matches_origin(origin, trusted):
        parsed = urlsplit(trusted)
        domain = parsed.netloc
        if domain.startswith('*.'):
            domain = domain[1:]
        return origin.scheme == parsed.scheme and is_same_domain(origin.netloc, domain)
