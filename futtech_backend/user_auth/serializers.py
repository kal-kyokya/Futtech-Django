#!/usr/bin/env python3
"""
'serializers.py' contains DRF serialization classes defining how input
		 data should be validated before creation of complex python
		 objects, such as Django Model instances.
"""

from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.tokens import RefreshToken


UserModel = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Handles validation of the user data sent in the request body, as well as
    creation of Django-compliant complex python objects (Model fields).

    Inheritance:
    	serializers.ModelSerializer - Avail rest_framework's out-of-the-box
    	features enabling data validation and serialization/deserialization.
    """

    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(
            queryset=UserModel.objects.all(),
            message='A user with this email already exists.'
        )]
    )
    username = serializers.CharField(
        required=True,
        validators=[UniqueValidator(
            queryset=UserModel.objects.all(),
            message='A user with username already exists.'
        )]
    )

    # 'write_only=True' ensures these sensitive fields are used for input
    # and validation, but never serialized and returned in any API response.
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
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
        fields = ['email', 'username', 'password', 'password2']

        # Additional configuration not directly tied to model fields
        extra_kwargs = {
            'password': {
                'write_only': True,
                'required': True,
            },
            'password2': {
                'write_only': True,
                'required': True,
            }
        }

    def validate(self, attrs):
        """
        Handles password confirmation and initializes data validation.

        Params:
        	self - A python object representing the class instance.
        	attrs - A dictionary containing the data to be serialized.

        Return:
        	The 'attrs' dictionary if no validation error is raised.
        """

        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                'password2': 'Password fields did not match'
            })

        # Validate password strength with Django's built-in validation function
        try:
            validate_password(attrs['password'])
        except serializers.ValidationError as err:
            raise serializers.ValidationError({
                'password': list(err.messages)
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

        validated_data.pop('password2')

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
        	A python dictionary made of the JWT access and
        	refresh tokens, as well as basic user infos.
        """

        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = UserModel.objects.get(email=email)
        except UserModel.DoesNotExist:
            raise serializers.ValidationError({
                'email': 'Invalid email'
            })

        # Authenticate the user using a Django built-in authentication function
        authenticated_user = authenticate(username=user.username,
                                          password=password)
        if not authenticated_user:
            raise serializers.ValidationError({
                'password': 'Invalid password.'
            })

        if not authenticated_user.is_active:
            raise serializers.ValidationError('User account is disabled.')

        refresh = RefreshToken.for_user(user)

        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            },
        }
