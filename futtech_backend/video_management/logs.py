#!/usr/bin/env python3
"""
'logs.py' initializes an application level log file for debugging purposes.
"""

import logging


# Logger Object Setup
logger = logging.getLogger('video_management')
logger.setLevel(logging.DEBUG)

# File Handler Setup
file_handler = logging.FileHandler('video-management.log')
file_handler.setLevel(logging.DEBUG)

# Addition of a custom logging format
format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(format)

logger.addHandler(file_handler)
