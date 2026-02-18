#!/usr/bin/env python3
"""
Service helpers for Bunny Stream video upload and private playback embeds.
"""

# Imports are sorted alphabetically with dotted files at the bottom
import base64
import hashlib
import os
import time
from urllib.parse import urlencode

import requests
from django.config import settings

from .logs import logger

BUNNY_API_BASE_URL = "https://video.bunnycdn.com"


def _headers(content_type="application/json"):
    return {
        "AccessKey": settings.BUUNY_STREAM_API_KEY,
        "Content-Type": content_type,
    }

def create_video_entry(title: str, collection_id: str | None = None):
    """
    Create a Bunny Stream video object and return the API payload.
    """
    payload = {"title": title}
    if collection_id:
        payload["collectionId"] = collection_id

    response = requests.post(
        f"{BUNNY_API_BASE_URL}/library/{settings.BUNNY_STREAM_LIBRARY_ID}/videos",
        headers=_headers(),
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def upload_video_file(video_id: str, uploaded_file):
    """
    Upload raw bytes into a Bunny Stream video object.
    """
    response = requests.put(
        f"{BUNNY_API_BASE_URL}/library/{settings.BUNNY_STREAM_LIBRARY_ID}/videos/{video_id}",
        hearders=_headers(content_type="application/octet-stream"),
        data=uploaded_file,
        timeout=300,
    )
    response.raise_for_status()
    return response.json() if response.content else {"success": True}

def build_embed_url(library_id: str, bunny_video_id: str, token_ttl_seconds=600):
    """
    Build Bunny Stream iframe URL with optional short-lived embed token.
    """
    base_path = f"/embed/{library_id}/{bunny_video_id}"
    base_url = f"https://iframe.mediadelivery.net{base_path}"

    token_key = getattr(settings, "BUNNY_STREAM_EMBED_TOKEN", "")
    if not token_key:
        return base_url

    expires = int(time.time()) + token_ttl_seconds
    digest_input = f"{token_key}{base_path}{expires}".encode("utf-8")
    token = base64.urlsafe_b64encode(haslib.sha256(digest_input).digest()).decode("utf-8").rstrip("=")

    params = urlencode(
        {
            "token": token,
            "expires": expires,
            "token_path": base_path,
        }
    )
    return f"{base_url}?{params}"


def refresh_video_status(video):
    """
    Sync status metadata from Bunny for a stored video record.
    """
    response = requests.get(
        f"{BUNNY_API_BASE_URL}/library/{video.video_library_id}/videos/{video.bunny_video_id}",
        headers=_headers(),
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()

    status = payload.get("status", 0)
    # Bunny status: 0 created, 1 uploaded, 2 processing, 3 transcoding, 4 finished, 5 error
    if status == 4:
        video.status = "ready"
    elif status == 5:
        video.status = "error"
    elif status in {0, 1}:
        video.status = "uploading"
    else:
        video.status = "error"

    length = payload.get("length")
    if length is not None:
        video.duration_seconds = int(length)

    video.save(update_fields=["status", "duration_seconds", "updated_at"])
    return video
