import type { Seeder } from './interfaces';

export class SeederRegistry {
  private seeders: Map<string, Seeder> = new Map();
  private executionOrder: string[] = [];

  register(seeder: Seeder): void {
    if (this.seeders.has(seeder.config.name)) {
      console.warn(`⚠️ Seeder "${seeder.config.name}" is already registered, overwriting...`);
    }

    this.seeders.set(seeder.config.name, seeder);
    this.calculateExecutionOrder();
  }

  unregister(name: string): boolean {
    const result = this.seeders.delete(name);
    if (result) {
      this.calculateExecutionOrder();
    }
    return result;
  }

  getSeeders(): Map<string, Seeder> {
    return new Map(this.seeders);
  }

  getSeeder(name: string): Seeder | undefined {
    return this.seeders.get(name);
  }

  getExecutionOrder(): string[] {
    return [...this.executionOrder];
  }

  listSeeders(): void {
    console.log('\n📋 Registered Seeders:');
    console.log('─'.repeat(80));

    if (this.seeders.size === 0) {
      console.log('No registered seeders found.');
      return;
    }

    for (const name of this.getExecutionOrder()) {
      const seeder = this.seeders.get(name)!;
      const priority = seeder.config.priority ?? 100;
      const deps = seeder.config.dependencies?.join(', ') || 'None';
      const description = seeder.config.description || 'No description';

      console.log(`🌱 ${name}`);
      console.log(`   Description: ${description}`);
      console.log(`   Priority: ${priority}`);
      console.log(`   Dependencies: ${deps}`);
      console.log(`   Rollback: ${seeder.rollback ? 'Available' : 'Not available'}`);
      console.log('');
    }
  }

  private calculateExecutionOrder(): void {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (name: string): void => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving seeder: ${name}`);
      }

      const seeder = this.seeders.get(name);
      if (!seeder) {
        throw new Error(`Seeder not found: ${name}`);
      }

      visiting.add(name);

      // Visit dependencies first
      if (seeder.config.dependencies) {
        for (const dep of seeder.config.dependencies) {
          visit(dep);
        }
      }

      visiting.delete(name);
      visited.add(name);
      order.push(name);
    };

    // Sort all seeders by priority
    const sortedSeeders = Array.from(this.seeders.entries()).sort(([, a], [, b]) => {
      const priorityA = a.config.priority ?? 100;
      const priorityB = b.config.priority ?? 100;
      return priorityA - priorityB;
    });

    // Resolve dependencies for each seeder
    for (const [name] of sortedSeeders) {
      visit(name);
    }

    this.executionOrder = order;
  }
}

// Global registry instance
export const seederRegistry = new SeederRegistry();

// Convenience function for registering seeders
export const registerSeeder = (seeder: Seeder): void => {
  seederRegistry.register(seeder);
};
