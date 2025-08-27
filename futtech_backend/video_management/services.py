#!/usr/bin/env python3
"""
'services.py' contains the logic allowing the Futtech Backend to hit the API of
the designated VPaaS (Mux|27-Aug-2025) while mitigating 'vendor lock-in' risks.
"""

import os
import mux_python
from .models import Video
from dotenv import load_dotenv


# --------------------------
# Mux API Configuration
# --------------------------

# Laying out foundation for Basic Authentication
load_dotenv()

configuration = mux_python.Configuration()
configuration.username = os.environ.get('MUX_TOKEN_ID')
configuration.password = os.environ.get('MUX_TOKEN_SECRET')
