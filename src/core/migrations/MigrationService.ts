import { QueryClient } from '@tanstack/react-query';

import semver from 'semver/preload';

import { version as currentVersion } from '../../../package.json';
import { PreferencesContextProps } from '../contexts/PreferencesContext';
import { Migration } from '../types/migrations';
import { storeCoursePreferencesByShortcode } from './1.5.0/storeCoursePreferencesByShortcode';
import { migrateCourseFilesCacheToDocumentsDirectory } from './1.6.2/migrateCourseFilesCacheToDocumentsDirectory';
import { invalidateCache } from './common';

export class MigrationService {
  private static migrations: Migration[] = [
    {
      runBeforeVersion: '1.5.0',
      run: [storeCoursePreferencesByShortcode, invalidateCache],
    },
    {
      runBeforeVersion: '1.6.2',
      run: [migrateCourseFilesCacheToDocumentsDirectory],
    },
  ];

  static needsMigration(preferences: PreferencesContextProps) {
    const { lastInstalledVersion } = preferences;
    return (
      !lastInstalledVersion || semver.lt(lastInstalledVersion, currentVersion)
    );
  }

  static async migrateIfNeeded(
    preferences: PreferencesContextProps,
    queryClient: QueryClient,
  ) {
    const { lastInstalledVersion: lastMigratedVersion, updatePreference } =
      preferences;
    if (MigrationService.needsMigration(preferences)) {
      console.debug(
        `Migrating from version ${lastMigratedVersion} to version ${currentVersion}`,
      );

      const migrationSteps = MigrationService.migrations.filter(migration => {
        if (!lastMigratedVersion) return true;
        return semver.lt(lastMigratedVersion, migration.runBeforeVersion);
      });

      for (const migration of migrationSteps) {
        for (const run of migration.run) {
          console.debug('Running migration', migration.runBeforeVersion);
          await run(preferences, queryClient);
        }
      }

      console.debug('Updating lastInstalledVersion to', currentVersion);

      updatePreference('lastInstalledVersion', currentVersion);
    }
  }
}
