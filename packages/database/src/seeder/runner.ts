import type { PrismaClient } from '../../client/client';
import type { SeederExecutionStats, SeederRunOptions } from './interfaces';
import { seederRegistry } from './registry';

export class SeederRunner {
  constructor(private prisma: PrismaClient) {}

  async runAll(options: SeederRunOptions = {}): Promise<SeederExecutionStats[]> {
    const { includeOnly, exclude = [] } = options;
    const stats: SeederExecutionStats[] = [];

    let seedersToRun = seederRegistry.getExecutionOrder();

    if (includeOnly && includeOnly.length > 0) {
      seedersToRun = seedersToRun.filter((name) => includeOnly.includes(name));
    }

    seedersToRun = seedersToRun.filter((name) => !exclude.includes(name));

    console.log(`🌱 ${seedersToRun.length} seeders will be executed...`);
    console.log(`📋 Execution order: ${seedersToRun.join(' → ')}`);

    for (const name of seedersToRun) {
      const stat = await this.runSeeder(name);
      stats.push(stat);

      if (!stat.success) {
        console.error(`❌ Seeder "${name}" failed, stopping execution`);
        throw stat.error;
      }
    }

    console.log('🎉 All seeders completed successfully!');
    return stats;
  }

  async runSeeder(name: string): Promise<SeederExecutionStats> {
    const seeder = seederRegistry.getSeeder(name);

    if (!seeder) {
      const error = new Error(`Seeder not found: ${name}`);
      return {
        name,
        startTime: Date.now(),
        endTime: Date.now(),
        duration: 0,
        success: false,
        error,
      };
    }

    const startTime = Date.now();
    console.log(`🔄 Running "${name}" seeder...`);

    try {
      await seeder.seed(this.prisma);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ "${name}" completed (${duration}ms)`);

      return {
        name,
        startTime,
        endTime,
        duration,
        success: true,
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.error(`❌ Error in "${name}" seeder:`, error);

      return {
        name,
        startTime,
        endTime,
        duration,
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async rollbackSeeder(name: string): Promise<void> {
    const seeder = seederRegistry.getSeeder(name);

    if (!seeder) {
      throw new Error(`Seeder not found: ${name}`);
    }

    if (!seeder.rollback) {
      throw new Error(`Seeder "${name}" does not have a rollback function defined`);
    }

    console.log(`⏪ Rolling back "${name}" seeder...`);
    await seeder.rollback(this.prisma);
    console.log(`✅ "${name}" rollback completed`);
  }

  async rollbackAll(): Promise<void> {
    const seedersWithRollback = seederRegistry
      .getExecutionOrder()
      .reverse() // Rollback in reverse order
      .filter((name) => {
        const seeder = seederRegistry.getSeeder(name);
        return seeder?.rollback;
      });

    if (seedersWithRollback.length === 0) {
      console.log('⚠️ No seeders with rollback function found');
      return;
    }

    console.log(`⏪ ${seedersWithRollback.length} seeders will be rolled back...`);
    console.log(`📋 Rollback order: ${seedersWithRollback.join(' → ')}`);

    for (const name of seedersWithRollback) {
      try {
        await this.rollbackSeeder(name);
      } catch (error) {
        console.error(`❌ Error in "${name}" rollback:`, error);
        throw error;
      }
    }

    console.log('🎉 All rollbacks completed successfully!');
  }
}
