#!/usr/bin/env python3
from django.urls import path
from .views import UserUpdateView

urlpatterns = [
    path('users/<int:user_id>', UserUpdateView.as_view(), name='user-update'),
]
