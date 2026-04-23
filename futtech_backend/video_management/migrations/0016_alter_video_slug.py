from django.db import migrations
from django.utils.text import slugify


def ensure_slug_column(apps, schema_editor):
    table_name = 'video_management_video'
    connection = schema_editor.connection

    with connection.cursor() as cursor:
        columns = {
            column.name
            for column in connection.introspection.get_table_description(cursor, table_name)
        }

    if 'slug' not in columns:
        schema_editor.execute(
            f'ALTER TABLE {table_name} ADD COLUMN slug varchar(280) NULL'
        )


def ensure_showcase_column(apps, schema_editor):
    table_name = 'video_management_video'
    connection = schema_editor.connection

    with connection.cursor() as cursor:
        columns = {
            column.name
            for column in connection.introspection.get_table_description(cursor, table_name)
        }

    if 'is_showcase' not in columns:
        schema_editor.execute(
            f'ALTER TABLE {table_name} ADD COLUMN is_showcase boolean NOT NULL DEFAULT false'
        )


def backfill_missing_slugs(apps, schema_editor):
    table_name = 'video_management_video'
    connection = schema_editor.connection

    with connection.cursor() as cursor:
        cursor.execute(
            f'SELECT id, title, slug FROM {table_name} ORDER BY created_at, id'
        )
        rows = list(cursor.fetchall())

    existing_slugs = {
        (row[2] or '').strip()
        for row in rows
        if (row[2] or '').strip()
    }

    with connection.cursor() as cursor:
        for row_id, title, slug in rows:
            existing_slug = (slug or '').strip()
            if existing_slug:
                continue

            base_slug = slugify(title or 'video')[:240] or 'video'
            candidate = base_slug
            counter = 1
            while candidate in existing_slugs:
                counter += 1
                candidate = f'{base_slug}-{counter}'

            cursor.execute(
                f'UPDATE {table_name} SET slug = %s WHERE id = %s',
                [candidate, row_id],
            )
            existing_slugs.add(candidate)


def ensure_slug_unique_index(apps, schema_editor):
    table_name = 'video_management_video'
    schema_editor.execute(
        f'CREATE UNIQUE INDEX IF NOT EXISTS {table_name}_slug_uniq_idx '
        f'ON {table_name} (slug)'
    )


class Migration(migrations.Migration):

    dependencies = [
        ('video_management', '0015_video_is_showcase_video_slug'),
    ]

    operations = [
        migrations.RunPython(ensure_slug_column, migrations.RunPython.noop),
        migrations.RunPython(ensure_showcase_column, migrations.RunPython.noop),
        migrations.RunPython(backfill_missing_slugs, migrations.RunPython.noop),
        migrations.RunPython(ensure_slug_unique_index, migrations.RunPython.noop),
    ]
