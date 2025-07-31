import type { Seeder } from './interfaces';
import { registerSeeder } from './registry';

export class SeederLoader {
  private loadedSeeders: Set<string> = new Set();
  private silent: boolean = false;

  setSilent(silent: boolean): void {
    this.silent = silent;
  }

  async loadSeedersFromModule(moduleProvider: () => Promise<Seeder[]> | Seeder[]): Promise<number> {
    try {
      const seeders = await moduleProvider();
      let successCount = 0;
      let errorCount = 0;

      if (!this.silent) {
        console.log(`🔄 Loading ${seeders.length} seeder modules...`);
      }

      for (const seeder of seeders) {
        try {
          if (!seeder) {
            if (!this.silent) {
              console.warn(`⚠️ Seeder is null or undefined`);
            }
            errorCount++;
            continue;
          }

          if (!seeder.config?.name) {
            if (!this.silent) {
              console.warn(`⚠️ Seeder config missing or name property not found`);
            }
            errorCount++;
            continue;
          }

          if (this.loadedSeeders.has(seeder.config.name)) {
            if (!this.silent) {
              console.warn(`⚠️ Seeder "${seeder.config.name}" already loaded, skipping...`);
            }
            continue;
          }

          registerSeeder(seeder);
          this.loadedSeeders.add(seeder.config.name);
          successCount++;
        } catch (error: any) {
          if (!this.silent) {
            console.warn(`⚠️ Seeder could not be registered:`, error.message);
          }
          errorCount++;
        }
      }

      if (successCount > 0 && !this.silent) {
        console.log(`✅ ${successCount} seeders loaded successfully`);
      }

      if (errorCount > 0 && !this.silent) {
        console.warn(`⚠️ ${errorCount} seeders could not be loaded`);
      }

      return successCount;
    } catch (error) {
      if (!this.silent) {
        console.error(`❌ Failed to load seeder module:`, error);
      }
      throw error;
    }
  }

  async loadSeedersFromPath(path: string): Promise<number> {
    try {
      const module = await import(path);
      const seeders = module.default || module.seeders || [];
      return this.loadSeedersFromModule(() => seeders);
    } catch (error) {
      if (!this.silent) {
        console.error(`❌ Failed to load seeders from path "${path}":`, error);
      }
      return 0;
    }
  }

  getLoadedSeeders(): string[] {
    return Array.from(this.loadedSeeders);
  }

  isSeederLoaded(name: string): boolean {
    return this.loadedSeeders.has(name);
  }

  clear(): void {
    this.loadedSeeders.clear();
  }
}

// Global loader instance
export const seederLoader = new SeederLoader();

/**
 * Load all seeders from centralized registry
 * This is the single source of truth for seeder loading
 */
export async function loadAllSeeders(silent: boolean = false): Promise<number> {
  seederLoader.setSilent(silent);

  if (!silent) {
    console.log('🎯 Loading seeders from centralized registry...');
  }

  try {
    const { loadAllSeeders: loadFromRegistry } = await import('../../config/seeder-registry');
    const seeders = await loadFromRegistry();

    if (!Array.isArray(seeders)) {
      if (!silent) {
        console.warn(`⚠️ Expected array of seeders, got ${typeof seeders}`);
      }
      return 0;
    }

    // Load seeders using the loader
    const loadedCount = await seederLoader.loadSeedersFromModule(() => seeders);

    if (!silent) {
      console.log(`🎉 Total ${loadedCount} seeders loaded`);
    }
    return loadedCount;
  } catch (error) {
    if (!silent) {
      console.warn(`⚠️ Failed to load seeders:`, error);
    }
    return 0;
  }
}
