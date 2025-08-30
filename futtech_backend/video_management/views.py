#!/usr/bin/env python3
"""
'video_management.views.py' is the entry point to this application's
Business logic and Data layer, for defined set of URLs.
"""

from django.http import JsonResponse, HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from .models import Video
from . import services


@login_required
def get_playback_token(request, video_id):
    """
    Handles HTTP requests for Mux video assets ready for consumption.

    Params:
    	request - A dictionary object representing the client's request.
    	video_id - A string representing the Mux asset ID requested.

    Return:
    	A JSON Web Token containing a signed version of the playback ID.
    """
