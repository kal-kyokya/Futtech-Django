from rest_framework import serializers

from .models import Tenant


class TenantSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = ['slug', 'name', 'logo', 'primary_color', 'description']

    def get_logo(self, obj):
        request = self.context.get('request')
        if not obj.logo:
            return f'/tenant-logos/{obj.slug}.svg'

        if request:
            return request.build_absolute_uri(obj.logo.url)

        return obj.logo.url
