#!/usr/bin/env python3
"""
'services.py' contains the logic allowing the Futtech Backend to hit the API of
the designated VPaaS (Mux|27-Aug-2025) while mitigating 'vendor lock-in' risks.
"""

# Imports are sorted alphabetically with dotted files at the bottom
import datetime
from dotenv import load_dotenv
import mux_python
import os
from .logs import logger
from .models import Video

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
        logger.error("Exception when calling DirectUploadsApi->create_direct_api: {}".format(err))
        return None


def handle_mux_webhook(payload, signature_header):
    """
    Verifies and processes incoming Mux webhooks (Automated notifications from
    Mux to this App signaling completion status of asynchronous event).

    Params:
    	payload - JSON object containing the status of the Mux event.
    	signature_header - Hash of the request body and timestamp for security,
    			   generated using a unique Mux webhook secret key.

    Return:
    	A boolean (True) if no exception is raised during processing.
    """

    # It is CRITICAL to verify the webhook signature for security
    webhook_secret = os.environ.get('MUX_WEBHOOK_SIGNING_SECRET', '')
    try:
        # The Mux SDK's verify function will raise an error if invalid
        mux_python.webhooks.verify_header(payload,
                                          signature_header,
                                          webhook_secret)
    except ValueError as err:
        # Invalid signature
        logger.error("Exception verifying the Mux webhook: {}".format(err))
        return False

    event_data = payload.get('data', {})
    event_type = payload.get('type')

    if event_type == 'video.asset.ready':
        asset_id = event_data.get('id')
        playback_id = event_data.get('playback_ids', [{}]).get('id')
        duration = event_data.get('duration')

        # Find the corresponding video in our database and update it
        try:
            video = Video.objects.get(mux_asset_id=asset_id)
            video.mux_playback_id = playback_id
            video.duration = datetime.timedelta(seconds=duration)
            video.status = Video.VideoStatus.READY
            video.save()
        except Video.DoesNotExist as err:
            logger.error("Exception updating video object upon Mux creation: {}".format(err))
    elif event_type == 'video.asset.errored':
        asset_id = event_data.get('id')
        try:
            video = Video.objects.get(mux_asset_id=asset_id)
            video.status = Video.VideoStatus.ERROR
            video.save()
        except Video.DoesNotExist as err:
            logger.error("Exception updating video after Mux creation err: {}".format(err))

    # End of verification and processing of webhooks from Mux
    return True
