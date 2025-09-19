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

    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(
            queryset=get_user_model().objects.all(),
            message='A user with this email already exists.'
        )]
    )
    username = serializers.CharField(
        required=True,
        validators=[UniqueValidator(
            queryset=get_user_model().objects.all(),
            message='A user with username already exists.'
        )]
    )
    password2 = serializer.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    class Meta:
        """
        Central place for configuration of the manner in which this serializer
        instance of 'ModelSerializer' interacts with its associated Django
        model.

        Also defines how data is to be presented and handled during/after
        serialization and deserialization.
        """

        # Django model upon which this serializer primarily acts
        model = get_user_model()

        # Model fields to include during serialization and deserialization
        fields = ('email', 'username', 'password', 'password2')

        # Additional configuration not directly tied to model fields
        extra_kwargs = {
            'password': {
                'write_only': True,
                'required': True,
            }
        }

