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


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Handles validation of the user data sent as request body as well as
    the creation of Django compliant complex python objects (Model fields)

    Inheritance:
    	serializers.ModelSerializer - Avail rest_framework's out-of-the-box
    	features enabling data validation and serialization/deserialization.
    """
