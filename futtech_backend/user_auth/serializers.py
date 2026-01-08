#!/usr/bin/env python3
"""
'serializers.py' contains DRF serialization classes defining how input
		 data should be validated before creation of complex python
		 objects, such as Django Model instances.
"""

from django.db.models import Q
from django.contrib.auth import get_user_model, authenticate
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from video_management.models import UserProfile


UserModel = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Handles validation of the user data sent in the request body, as well as,
    creation of Django-compliant complex python objects (Model fields).

    Inheritance:
    	serializers.ModelSerializer - Avails rest_framework's out-of-the-box
    	features enabling data validation and serialization/deserialization.
    """

    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)

    # 'write_only=True' ensures these sensitive fields are used for input
    # and validation, but never serialized and returned in any API response.
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    passwordConfirm = serializers.CharField(
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
        model = UserModel

        # Model fields to include in the python dictionary-like object
        # returned after effective validation
        fields = ['email', 'username', 'password', 'passwordConfirm']

        # Additional configuration not directly tied to model fields
        extra_kwargs = {
            'password': {
                'write_only': True,
                'required': True,
            },
            'passwordConfirm': {
                'write_only': True,
                'required': True,
            }
        }

    def validate(self, attrs):
        """
        Handles password confirmation and initializes data validation.

        Params:
        	self - A python object representing the current class instance.
        	attrs - A dictionary containing the data to be serialized.

        Return:
        	The 'attrs' dictionary if no validation error is raised.
        """

        if attrs['password'] != attrs['passwordConfirm']:
            raise serializers.ValidationError({
                'passwordConfirm': '[Password fields did not match]'
            })

        email = attrs.get('email')
        username = attrs.get('username')

        if email and username:
            existing_users = UserModel.objects.filter(
                Q(email__iexact=email) | Q(username__iexact=username)
            )
            if existing_users.exists():
                errors = {}
                if existing_users.filter(email__iexact=email).exists():
                    errors['email'] = ['A user with this email already exists.]'
                if existing_users.filter(username__iexact=username).exists():
                    errors['username'] = ['A user with this username already exists.']
                raise serializers.ValidationError(errors)

        # Validate password strength with Django's built-in validation function
        try:
            validate_password(attrs['password'])
        except (DjangoValidationError, serializers.ValidationError) as err:
            messages = getattr(err, 'messages', [str(err)])
            raise serializers.ValidationError({
                'password': list(messages)
            })

        return attrs
    
    def create(self, validated_data):
        """
        Handles creation of a new row in the User model.

        Params:
        	self - A representation of the current class instance.
        	validated_data - A dictionary-like object containing all the
        			 serializer fields defined as class attributes.

        Return:
        	A newly created instance of the Django User model.
        """

        validated_data.pop('passwordConfirm')
        validated_data['email'] = UserModel.objects.normalize_email(
            validated_data['email']
        )

        # 'create_user' automatically handles password hashing
        user = UserModel.objects.create_user(**validated_data)

        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Handles validation of the user data before its conversion to/from JSON.

    Inheritance:
    	serializers.Serializer - Empowers this subclass with
    	predefined attributes and methods facilitating processes
    	of validation, serialization and deserialization.
    """

    # Uses email instead of username to keep the app professional
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """
        Contains the core of this serializer's conversion logic.

        Params:
        	self - An instanciation of this serializer subclass.
        	attrs - The user data sent inside the HTTP request.

        Return:
        	A python dictionary containing basic user infos.
        """

        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = UserModel.objects.get(email__iexact=email)
        except UserModel.DoesNotExist:
            raise AuthenticationFailed('Invalid email.')

        if not user.is_active:
            raise AuthenticationFailed('User account is disabled.')

        # Authenticate the user using a Django built-in authentication function
        authenticated_user = authenticate(username=user,
                                          password=password)
        if not authenticated_user:
            raise AuthenticationFailed(f'Invalid password.')

        return {
            'user': authenticated_user,
        }


class CurrentUserSerializer(serializers.ModelSerializer):
    """
    Handles creation of a JSON-seriazable format off of an input HTTP request.

    Inheritance:
    	serializers.ModelSerializer - Avail rest_framework's out-of-the-box
    	features enabling data validation and serialization/deserialization.
    """

    class Meta:
        model = UserProfile
        fields = '__all__'
