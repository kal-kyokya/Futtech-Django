"""
Fast, isolated settings for Futtech XI's deterministic test suite.
"""
from .dev import *

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
MIGRATION_MODULES = {app.split('.')[-1]: None for app in INSTALLED_APPS}
