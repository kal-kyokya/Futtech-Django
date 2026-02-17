from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('video_management', '0010_video_mux_upload_id_alter_userprofile_team_and_more'),
    ]

    operations = [
        migrations.RemoveField(model_name='video', name='mux_asset_id'),
        migrations.RemoveField(model_name='video', name='mux_playback_id'),
        migrations.RemoveField(model_name='video', name='mux_playback_policy'),
        migrations.RemoveField(model_name='video', name='mux_upload_id'),
        migrations.RemoveField(model_name='video', name='duration'),
        migrations.AddField(
            model_name='video',
            name='bunny_video_id',
            field=models.CharField(blank=True, max_length=255, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='video',
            name='duration_seconds',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='video',
            name='video_library_id',
            field=models.CharField(blank=True, max_length=64, null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='video',
            name='status',
            field=models.CharField(
                choices=[
                    ('created', 'Created'),
                    ('uploading', 'Uploading'),
                    ('processing', 'Processing'),
                    ('ready', 'Ready'),
                    ('error', 'Error'),
                ],
                default='created',
                max_length=20,
            ),
        ),
    ]
