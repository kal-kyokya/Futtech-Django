from django.db import migrations, models


def populate_video_slugs(apps, schema_editor):
    Video = apps.get_model('video_management', 'Video')

    for video in Video.objects.all().order_by('created_at', 'id'):
        existing_slug = (video.slug or '').strip()
        if existing_slug:
            continue

        base_slug = (video.title or 'video').strip().lower().replace(' ', '-')[:240] or 'video'
        slug = base_slug
        counter = 1
        while Video.objects.filter(slug=slug).exclude(pk=video.pk).exists():
            counter += 1
            slug = f'{base_slug}-{counter}'

        video.slug = slug
        video.save(update_fields=['slug'])


class Migration(migrations.Migration):

    dependencies = [
        ('video_management', '0014_rename_video_manage_provider_5a7f7d_idx_video_manag_provide_66a318_idx_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='is_showcase',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='video',
            name='slug',
            field=models.SlugField(blank=True, max_length=280, null=True),
        ),
        migrations.RunPython(populate_video_slugs, migrations.RunPython.noop),
        migrations.AddField(
            model_name='video',
            name='slug',
            field=models.SlugField(blank=True, max_length=280, unique=True),
        ),
    ]
