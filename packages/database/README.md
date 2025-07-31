# Database Package

This package provides a centralized database management system for all applications in the monorepo.

## Features

- 🔧 **Prisma Client** - Type-safe database operations
- 🌱 **Modular Seeder System** - Organized and manageable seeder structure
- 🎯 **Dependency Management** - Inter-seeder dependency management
- ⚡ **CLI Interface** - Easy management from command line
- 🔄 **Rollback Support** - Rollback functionality
- 📊 **Priority System** - Execution order control

## Seeder Module Structure

```
config/
├── env.ts              # Environment configuration
├── seeder-registry.ts  # Central seeder registry
└── index.ts           # Config exports

src/seeder/
├── interfaces.ts    # Type definitions
├── registry.ts      # Seeder registration system
├── loader.ts        # Dynamic seeder loading
├── runner.ts        # Seeder execution engine
├── utils.ts         # Helper functions
├── cli.ts           # CLI implementation
└── index.ts         # Main exports
```

## Creating Seeders

### Simple Seeder

```typescript
import { createSeeder } from '@onlyjs/db';

export const userSeeder = createSeeder(
  {
    name: 'users',
    description: 'Create test users',
    priority: 10,
  },
  async (prisma) => {
    await prisma.user.create({
      data: { name: 'Test User', email: 'test@example.com' }
    });
  }
);
```

### Seeder with Rollback Support

```typescript
export const userSeeder = createSeeder(
  {
    name: 'users',
    description: 'Create test users',
    priority: 10,
  },
  async (prisma) => {
    // Seed logic
    await prisma.user.create({
      data: { name: 'Test User', email: 'test@example.com' }
    });
  },
  async (prisma) => {
    // Rollback logic
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' }
    });
  }
);
```

### Seeder with Dependencies

```typescript
export const postSeeder = createSeeder(
  {
    name: 'posts',
    description: 'Create test posts',
    priority: 20,
    dependencies: ['users'], // users seeder runs first
  },
  async (prisma) => {
    const user = await prisma.user.findFirst();
    await prisma.post.create({
      data: { title: 'Test Post', authorId: user.id }
    });
  }
);
```

## Registering Seeders

### 1. Create Application Seeders

```typescript
// apps/your-app/src/seeders/index.ts
import { userSeeder } from './user.seeder';
import { postSeeder } from './post.seeder';

export default [
  userSeeder,
  postSeeder,
];
```

### 2. Add to Central Registry

```typescript
// packages/database/config/seeder-registry.ts
export const SEEDER_MODULES: SeederModuleConfig[] = [
  {
    name: 'api-seeders',
    path: '../../../../apps/api/src/seeders',
    description: 'API application seeders',
    enabled: true,
  },
  {
    name: 'your-app-seeders',  // 👈 New application added
    path: '../../../../apps/your-app/src/seeders',
    description: 'Your App seeders',
    enabled: true,
  },
];
```

**Single Source of Truth**: All seeder modules are centrally managed in the `config/seeder-registry.ts` file.

## CLI Usage

### List All Seeders
```bash
bun run cli.ts list
```

### Run All Seeders
```bash
bun run cli.ts run
```

### Run Specific Seeders
```bash
bun run cli.ts run --only users,posts
bun run cli.ts run users
```

### Exclude Specific Seeders
```bash
bun run cli.ts run --exclude system-admin
```

### Rollback Operations
```bash
# Rollback specific seeder
bun run cli.ts rollback users

# Rollback all seeders
bun run cli.ts rollback --all
```

### Load External Seeders
```bash
bun run cli.ts load ./custom-seeders/index.js
```

## Programmatic Usage

```typescript
import { 
  seederRegistry, 
  SeederRunner, 
  seederLoader 
} from '@onlyjs/db';
import prisma from '@onlyjs/db/client';

// Load seeders
await seederLoader.loadSeedersFromPath('./seeders');

// Create runner
const runner = new SeederRunner(prisma);

// Run all
await runner.runAll();

// Run specific seeder
await runner.runSeeder('users');

// Rollback
await runner.rollbackSeeder('users');
```

## Best Practices

1. **Naming**: Use kebab-case (`user-data`, `world-data`)
2. **Priority**: 
   - System/Admin: 1-10
   - Base Data: 10-50  
   - User Data: 50-100
3. **Dependencies**: Avoid circular dependencies
4. **Rollback**: Define rollback functions whenever possible
5. **Idempotency**: Seeders should be runnable multiple times

## Migration

The old seeder system has been completely removed. The new modular structure:

- ✅ Cleaner code organization
- ✅ Better type safety
- ✅ Improved error handling
- ✅ Enhanced CLI interface
- ✅ Modular and extensible 