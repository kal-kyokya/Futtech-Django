import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('video_management', '0012_alter_video_video_library_id'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='access_expires_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name='PaymentTransaction',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('provider', models.CharField(choices=[('MPESA', 'Mpesa'), ('STRIPE', 'Stripe')], max_length=20)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('PROCESSING', 'Processing'), ('SUCCEEDED', 'Succeeded'), ('FAILED', 'Failed'), ('CANCELED', 'Canceled'), ('EXPIRED', 'Expired')], default='PENDING', max_length=20)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('currency', models.CharField(default='KES', max_length=3)),
                ('purpose', models.CharField(default='subscription', max_length=64)),
                ('external_reference', models.CharField(blank=True, default='', max_length=255)),
                ('merchant_reference', models.CharField(blank=True, default='', max_length=255)),
                ('provider_transaction_id', models.CharField(blank=True, default='', max_length=255)),
                ('provider_checkout_request_id', models.CharField(blank=True, default='', max_length=255)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('idempotency_key', models.CharField(max_length=128, unique=True)),
                ('error_code', models.CharField(blank=True, default='', max_length=128)),
                ('error_message', models.TextField(blank=True, default='')),
                ('fulfilled_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payment_transactions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'indexes': [models.Index(fields=['provider', 'status'], name='video_manage_provider_5a7f7d_idx'), models.Index(fields=['provider_checkout_request_id'], name='video_manage_provider_9adc01_idx'), models.Index(fields=['external_reference'], name='video_manage_externa_5d5df2_idx')],
            },
        ),
    ]
