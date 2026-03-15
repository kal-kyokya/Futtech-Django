from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import TenantSerializer

DEFAULT_BRANDING = {
    'slug': 'default',
    'name': 'Futtech',
    'logo': '/logo.png',
    'primary_color': '#028ECA',
    'description': 'Default Futtech branding',
}


class CurrentTenantView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        tenant = getattr(request, 'tenant', None)

        if not tenant:
            return Response(DEFAULT_BRANDING)

        serializer = TenantSerializer(tenant, context={'request': request})
        return Response(serializer.data)
