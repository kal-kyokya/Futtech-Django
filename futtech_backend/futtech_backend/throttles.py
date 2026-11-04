"""
Custom DRF throttles used by security-sensitive endpoints.
"""

from rest_framework.settings import api_settings
from rest_framework.throttling import SimpleRateThrottle, UserRateThrottle

class LoginRateThrottle(SimpleRateThrottle):
    """
    Limit credential attempts by IP even when a caller has an access token.
    """

    scope = 'login'
    default_rate = '3/min'

    def get_cache_key(self, request, view):
        return self.cache_format % {'scope': self.scope, 'ident': self.get_ident(request)}

    def get_rate(self):
        return api_settings.DEFAULT_THROTTLE_RATES.get(self.scope, self.default_rate)


class RegistrationRateThrottle(LoginRateThrottle):
    scope = 'registration'
    default_rate = '5/hour'


class RefreshRateThrottle(LoginRateThrottle):
    scope = 'token_refresh'
    default_rate = '60/min'


class AuthBurstRateThrottle(UserRateThrottle):
    """
    Throttle authenticated burst actions such as payment creation.
    """

    scope = 'auth_burst'
