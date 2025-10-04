#!/usr/bin/env python
"""
'playlists/pagination.py' contains the class customizing pagination of
			  playlist querysets.
"""

from rest_framework.pagination import PageNumberPagination


class PlaylistPagination(PageNumberPagination):
    """
    Defines the default and maximum number of playlists
    that are permitted to be requested per API call.

    Inheritance:
    	PageNumberPagination - Splits query results into 'pages' of objects.
    			       Basically turning the returned list into
    			       'a list of equal max_size lists'.

    			       It is DRF's built-in pagination system.
    """

    page_size = 3 # Default 3 playlists per page
    page_size_query_param = 'limit' # Frontend can override -> '?limit=4'
    max_page_size = 5 # Cap to avoid heavy payloads
