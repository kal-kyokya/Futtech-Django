#!/usr/bin/env python3
"""
'serializers.py' contains python classes defining process through which input
		 data should be validated before creation of Django-friendly
		 objects, like Django Model fields for example.
"""

import django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
