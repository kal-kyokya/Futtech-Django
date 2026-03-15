from django.core.management.base import BaseCommand

from tenants.models import Tenant


class Command(BaseCommand):
    help = 'Seed demo tenants for multi-tenant branding.'

    def handle(self, *args, **options):
        demo_tenants = [
            {
                'slug': 'coachkirubi',
                'name': 'Coach Kirubi',
                'primary_color': '#FF6600',
                'description': 'Demo coaching tenant.',
            },
            {
                'slug': 'tpmazembe',
                'name': 'TP Mazembe',
                'primary_color': '#003366',
                'description': 'Demo academy tenant.',
            },
        ]

        for tenant_data in demo_tenants:
            tenant, created = Tenant.objects.update_or_create(
                slug=tenant_data['slug'],
                defaults=tenant_data,
            )
            verb = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f"{verb} tenant: {tenant.slug}"))

        self.stdout.write(self.style.SUCCESS('Tenant seeding completed.'))
