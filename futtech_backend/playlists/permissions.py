#!/usr/bin/env python3
"""
'permissions.py' defines custom permission logic for playlist operations.
"""

from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Allows playlist owners to update/delete, while permitting reads for others.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHOFDS:
            return True

        return obj.owner == request.user

