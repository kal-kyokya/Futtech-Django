from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('video_management', '0017_alter_video_slug'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='video',
            name='owner',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='videos',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
