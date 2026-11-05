from django.apps import apps
from django.db.migrations.loader import MigrationLoader
from django.test import SimpleTestCase, override_settings

from .settings import test as fast_settings


class FastTestSettingsTests(SimpleTestCase):
    def test_fast_settings_use_actual_app_labels(self):
        self.assertLessEqual(set(apps.app_configs), set(fast_settings.MIGRATION_MODULES))

    def test_fast_settings_have_a_consistent_migration_graph(self):
        with override_settings(MIGRATION_MODULES=fast_settings.MIGRATION_MODULES):
            loader = MigrationLoader(None)
            self.assertFalse(loader.disk_migrations)
