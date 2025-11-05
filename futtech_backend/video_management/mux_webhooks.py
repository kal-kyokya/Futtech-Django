import hmac
import hashlib
import time


def verify_signature(request_body, mux_signature_header, webhook_secret, *, tolerance_seconds=300):
    """
    Verify the Mux webhook signature.

    Return:
    	A tuple '(is_valid, message)' so callers can decide how to handle
    	the outcome. 'message' will be None when the signature is valid.
    """

    if not mux_signature_header:
        return False, "Missing Mux-Signature header"

    # 1. Extract timestamp and signature from the Mux-Signature header
    # This header will be in the format: 't=<timestamp>,v1=<signature>'
    parts = mux_signature_header.split(',')
    timestamp_str = None
    signature_str = None

    for part in parts:
        part = part.strip()

        if part.startswith('t='):
            timestamp_str = part[2:]
        elif part.startswith('v1=') and signature_str is None:
            # Capture the first v1 signature. Additional values (e.g. v1=...)
            # will be ignored, mirroring Mux's guidance.
            signature_str = part[3:]

    if not timestamp_str or not signature_str:
        return False, "Invalid Mux-Signature header format."

    try:
        timestamp = int(timestamp_str)
    except ValueError:
        return False, "Invalid timestamp in Mux-Signature header"

    # 2. Construct the signed payload
    signed_payload = f"{timestamp}.{request_body.decode('utf-8')}"

    # 3. Generate our own signature
    hashed = hmac.new(
        webhook_secret.encode('utf-8'),
        signed_payload.encode('utf-8'),
        hashlib.sha256,
    )
    generated_signature = hashed.hexdigest()

    # 4. Compare signatures
    if not hmac.compare_digest(generated_signature, signature_str):
        return False, "Signature mismatch."

    # 5. Guard against replay attacks by enforcing timestamp tolerance
    current_time = int(time.time())
    if abs(current_time - timestamp) > tolerance_seconds:
        return False, "Webhook timestamp too old."

    return True, None

# Example Usage
#
# raw_request_body = b'{
#	"type": "video.asset.created",
#	"data": {"id": "some_asset_id"}
# }'
#
# mux_signature = 't=1678886400,v1=our_expected_signature'
#
# our_webhook_secret = 'whsec_our_secret_key'
#
# is_valid, message = verify_mux_webhook_signature(
#	raw_request_body,
#	mux_signature,
#	our_webhook_secret
# )
#
# print(f"Webhook valid: {is_valid}, Message: {message}")
