#!/usr/bin/env bun

import { loadEnv } from '../../config/env';
import prisma from '../../instance';
import { loadAllSeeders, seederLoader } from './loader';
import { seederRegistry } from './registry';
import { SeederRunner } from './runner';

interface CLIOptions {
  includeOnly?: string[];
  exclude?: string[];
}

export class SeederCLI {
  private runner: SeederRunner;

  constructor() {
    this.runner = new SeederRunner(prisma);
  }

  async execute(args: string[] = process.argv.slice(2)): Promise<void> {
    const [command, ...restArgs] = args;

    // Load environment variables first
    await loadEnv();

    // Load all seeders from centralized registry
    await loadAllSeeders();

    try {
      switch (command) {
        case 'list':
          await this.handleList();
          break;
        case 'run':
          await this.handleRun(restArgs);
          break;
        case 'rollback':
          await this.handleRollback(restArgs);
          break;
        case 'load':
          await this.handleLoad(restArgs);
          break;
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error('❌ CLI error:', error);
      process.exit(1);
    }
  }

  private async handleList(): Promise<void> {
    seederRegistry.listSeeders();
  }

  private async handleRun(args: string[]): Promise<void> {
    const options = this.parseRunOptions(args);
    const seederName = this.extractSeederName(args);

    if (seederName && seederName !== 'all') {
      await this.runner.runSeeder(seederName);
    } else {
      await this.runner.runAll(options);
    }
  }

  private async handleRollback(args: string[]): Promise<void> {
    const [target] = args;

    if (!target) {
      console.error('❌ Seeder name required for rollback');
      process.exit(1);
    }

    if (target === '--all') {
      await this.runner.rollbackAll();
    } else {
      await this.runner.rollbackSeeder(target);
    }
  }

  private async handleLoad(args: string[]): Promise<void> {
    const [path] = args;

    if (!path) {
      console.error('❌ Path required for loading seeders');
      process.exit(1);
    }

    const count = await seederLoader.loadSeedersFromPath(path);
    console.log(`📦 Loaded ${count} seeders from ${path}`);
  }

  private parseRunOptions(args: string[]): CLIOptions {
    const options: CLIOptions = {};

    const onlyIndex = args.indexOf('--only');
    if (onlyIndex !== -1 && args[onlyIndex + 1]) {
      // @ts-ignore
      options.includeOnly = args[onlyIndex + 1].split(',');
    }

    const excludeIndex = args.indexOf('--exclude');
    if (excludeIndex !== -1 && args[excludeIndex + 1]) {
      // @ts-ignore
      options.exclude = args[excludeIndex + 1].split(',');
    }

    return options;
  }

  private extractSeederName(args: string[]): string | undefined {
    // Find first argument that's not a flag
    for (const arg of args) {
      if (!arg.startsWith('--')) {
        return arg;
      }
    }
    return undefined;
  }

  private showHelp(): void {
    console.log(`
🌱 Seeder CLI

Usage:
  bun run seeder list                           # List all registered seeders
  bun run seeder run                            # Run all seeders
  bun run seeder run <seeder-name>              # Run specific seeder
  bun run seeder run --only <names>             # Run only specified seeders (comma separated)
  bun run seeder run --exclude <names>          # Exclude specified seeders from execution
  bun run seeder rollback <seeder-name>         # Rollback specific seeder
  bun run seeder rollback --all                 # Rollback all seeders (in reverse order)
  bun run seeder load <path>                    # Load seeders from specific path

Examples:
  bun run seeder run --only world-data,users    # Run only world-data and users seeders
  bun run seeder run --exclude system-admin     # Run all seeders except system-admin
  bun run seeder rollback users                 # Rollback users seeder
  bun run seeder rollback --all                 # Rollback all seeders
  bun run seeder load ./seeders/custom.js       # Load seeders from custom file
`);
  }
}

// Execute CLI when run directly
if (require.main === module) {
  const cli = new SeederCLI();
  cli.execute().finally(() => {
    process.exit(0);
  });
}
