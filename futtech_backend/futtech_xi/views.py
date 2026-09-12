import logging
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .orchestrator import FuttechXIOrchestrator, WorkflowError

logger = logging.getLogger(__name__)

class AnalyzeRequestSerializer(serializers.Serializer):
    query = serializers.CharField(trim_whitespace=True,
                                  min_length=8,
                                  max_length=1000)


@api_view(["GET"])
@permission_classes([AllowAny])
def healthz(request):
    return Response({
        "status": "ok",
        "service": "futtech-xi"
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def analyze(request):
    serializer = AnalyzeRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {
                "status": "invalid_request",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        return Response(FuttechXIOrchestrator().analyze(serializer.validated_data["query"]))
    except WorkflowError as exc:
        logger.warning("Futtech XI workflow unavailable: %s", exc)
        return Response(
            {
                "status": "unavailable",
                "detail": "The analysis service could not complete safely. Please try again.",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
