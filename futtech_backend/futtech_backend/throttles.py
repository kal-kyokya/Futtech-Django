"""
Custom DRF throttles used by security-sensitive endpoints.
"""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

class LoginRateThrottle(AnonRateThrottle):
    """
    Throttle repeated unauthenticated login attempts by client IP.
    """

    scope = 'login'


class AuthBurstRateThrottle(UserRateThrottle):
    """
    Throttle authenticated burst actions such as payment creation.
    """

    scope = 'auth_burst'
