#!/usr/bin/env python3
"""
'services.py' contains the logic allowing the Futtech Backend to hit the API of
the designated VPaaS (Mux|27-Aug-2025) while mitigating 'vendor lock-in' risks.
"""

import os
import mux_python
from dotenv import load_dotenv
from .models import Video
from .logs import logger

# --------------------------
# Mux API Configuration
# --------------------------

# Basic Authentication Setup
load_dotenv()

configuration = mux_python.Configuration()
configuration.username = os.environ.get('MUX_TOKEN_ID')
configuration.password = os.environ.get('MUX_TOKEN_SECRET')

# API Client Initialization
uploads_api = mux_python.DirectUploadsApi(
    mux_python.ApiClient(
        configuration
    )
)

def create_direct_upload_url():
    """
    Creates a new direct upload URL in Mux.

    Return:
    	A URL passed to the client to upload the file directly to Mux.
    """

    create_asset_request = mux_python.CreateAssetRequest(
        playback_policy=[
            mux_python.PlaybackPolicy.PUBLIC,
        ]
    )
    create_upload_request = mux_python.CreateUploadRequest(
        timeout=3600,
        new_asset_settings=create_asset_request,
        cors_origin='https://futtech.kalkyokya.tech'
    )

    try:
        create_upload_response = uploads_api.create_direct_upload(
            create_upload_request
        )
        logger.debug(str(create_upload_response))

        assert create_upload_response != None
        assert create_upload_response.data != None
        assert create_upload_response.data.id != None

        return create_upload_response.data
    except mux_python.ApiException as err:
        logger.error("Exception when calling UploadsApi->create_direct_api: {}".format(err))
        return None
