#!/usr/bin/env python
"""
'exception_handlers' provides custom exception handling for consistent API error responses.
"""

from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler

_STATUS_TITLES = {
    status.HTTP_400_BAD_REQUEST: "Bad Request",
    status.HTTP_401_UNAUTHORIZED: "Unauthorized",
    status.HTTP_403_FORBIDDEN: "Forbidden",
    status.HTTP_404_NOT_FOUND: "Not Found",
    status.HTTP_405_METHOD_NOT_ALLOWED: "Method Not Allowed",
    status.HTTP_409_CONFLICT: "Conflict",
    status.HTTP_422_UNPROCESSABLE_ENTITY: "Unprocessable Entity",
    status.HTTP_429_TOO_MANY_REQUESTS: "Too Many Requests",
    status.HTTP_500_INTERNAL_SERVER_ERROR: "Server Error",
}


def _normalize_fields(data):
    """
    Creates a standard field dictionary containing
    a filtered set of formatted key-value pairs.

    Param:
    	data - Response details headed client-side.

    Return:
    	A python dictionary with required fields, if success.
    """

    if not isinstance(data, dict):
        return None

    fields = {}
    for key, value in data.items():
        if key in {"detail", "title", "status", "code"}:
            continue
        if isinstance(value, list):
            fields[key] = ", ".join([str(item) for item in value])
        elif value is None:
            continue
        else:
            fields[key] = str(value)

    return fields or None


def _derive_message(data):
    """
    Extracts an error message from the response object's data.

    Param:
    	data - Response details headed client-side.

    Return:
    	A string object indicating the type of error raised.
    """

    if data is None:
        return "Unexpected error."

    if isinstance(data, dict):
        for key in ("detail", "message"):
            if key in data:
                return str(data[key])

        non_field = data.get("non_field_errors")
        if isinstance(non_field, list) and non_field:
            return str(non_field[0])

        for value in data.values():
            if isinstance(value, list) and value:
                return str(value[0])
            if isinstance(value, str):
                return value

    if isinstance(data, list) and data:
        return str(data[0])

    if isinstance(data, str):
        return data

    return "Unexpected error."


def custom_exception_handler(exc, context):
    """
    Scaffolds DRF Views' "exception_handler()" in order to
    customize the response objects returned on error.
    """

    response = exception_handler(exc, context)

    if response is None:
        return Response(
            {
                "status": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "title": _STATUS_TITLES[status.HTTP_500_INTERNAL_SERVER_ERROR],
                "detail": "An unexpected error occured.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    status_code = response.status_code
    data = response.data

    if isinstance(exc, ValidationError):
        response.data = data
        response.fields = data
        return response

    payload = {
        "status": status_code,
        "title": _STATUS_TITLES.get(status_code, "Error"),
        "detail": _derive_message(data),
    }

    fields = _normalize_fields(data)
    if fields:
        payload["fields"] = fields

    code = getattr(exc, "default_code", None)
    if code:
        payload["code"] = code

    response.data = payload
    return response
