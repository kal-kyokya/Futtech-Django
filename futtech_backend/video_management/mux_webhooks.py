import hmac
import hashlib
import time

def verify_signature(request_body, mux_signature_header, webhook_secret):
    # 1. Extract timestamp and signature from the Mux-Signature header
    parts = mux_signature_header.split(',')
    timestamp_str = None
    signature_str = None
    for part in parts:
        if part.startswith('t='):
            timestamp_str = part[2:]
        elif part.startswith('a='):
            signature_str = part[2:]

    if not timestamp_str or not signature_str:
        return False, "Invalid Mux-Signature header format."

    # 2. Construct the signed payload
    signed_payload = f"{timestamp_str}.{request_body.decode('utf-8')}"

    # 3. Generate your own signature
    hashed = hmac.new(
        webhook_secret.encode('utf-8'),
        signed_payload.encode('utf-8'),
        hashlib.sha256
    )
    generated_signature = hashed.hexdigest()

    # 4. Compare signatures
    if hmac.compare_digest(generated_signature, signature_str):
        # Optional: Check for timestamp staleness to prevent replay attacks
        # For example, reject if timestamp is older than a few minutes
        # current_time = int(time.time())
        # if abs(current_time - int(timestamp_str)) > 300: # 5 minutes
        #     return False, "Webhook timestamp too old."
        return True, "Signature verified successfully."
    else:
        return False, "Signature mismatch."

# Example Usage (replace with your actual values)
# raw_request_body = b'{"type": "video.asset.created", "data": {"id": "some_asset_id"}}'
# mux_signature = 't=1678886400,a=your_expected_signature_here'
# your_webhook_secret = 'whsec_your_secret_key_here'

# is_valid, message = verify_mux_webhook_signature(raw_request_body, mux_signature, your_webhook_secret)
# print(f"Webhook valid: {is_valid}, Message: {message}")
