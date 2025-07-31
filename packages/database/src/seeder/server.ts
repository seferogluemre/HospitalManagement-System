import { Elysia } from 'elysia';
import type { PrismaClient } from '../../client/client';
import { loadEnv } from '../../config';
import prisma from '../../instance';
import { loadAllSeeders } from './loader';
import { seederRegistry } from './registry';
import { SeederRunner } from './runner';

export interface SeederServerOptions {
  prefix?: string;
  prismaInstance?: PrismaClient;
  silent?: boolean;
}

export const createSeederServer = async ({
  prefix = '/seeder',
  prismaInstance,
  silent = false,
}: SeederServerOptions = {}) => {
  const prismaClient = prismaInstance || prisma;
  const runner = new SeederRunner(prismaClient);

  await loadEnv();
  await loadAllSeeders(silent);

  return (
    new Elysia({ prefix })
      // List all registered seeders
      .get(
        '/',
        async () => {
          const seeders = Array.from(seederRegistry.getSeeders().entries()).map(
            ([name, seeder]) => ({
              name,
              description: seeder.config.description,
              priority: seeder.config.priority ?? 100,
              dependencies: seeder.config.dependencies || [],
              hasRollback: !!seeder.rollback,
            }),
          );

          return {
            success: true,
            data: {
              seeders,
              executionOrder: seederRegistry.getExecutionOrder(),
            },
          };
        },
        {
          detail: {
            tags: ['Seeder'],
            summary: 'List all registered seeders',
            description:
              'Get a list of all registered seeders with their configuration and execution order',
          },
        },
      )

      // Run all seeders
      .post(
        '/run-all',
        async ({ query }) => {
          try {
            const includeOnly = query.include ? query.include.split(',') : undefined;
            const exclude = query.exclude ? query.exclude.split(',') : [];

            const stats = await runner.runAll({ includeOnly, exclude });

            return {
              success: true,
              message: 'All seeders completed successfully',
              data: stats,
            };
          } catch (error) {
            return {
              success: false,
              message: 'Seeder execution failed',
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
        {
          detail: {
            tags: ['Seeder'],
            summary: 'Run all seeders',
            description:
              'Execute all registered seeders in dependency order. Optional query parameters: include (comma-separated seeder names to include only) and exclude (comma-separated seeder names to exclude)',
          },
        },
      )

      // Run specific seeder
      .post(
        '/run/:name',
        async ({ params }) => {
          try {
            const stat = await runner.runSeeder(params.name);

            if (!stat.success) {
              return {
                success: false,
                message: `Seeder "${params.name}" failed`,
                data: stat,
                error: stat.error?.message,
              };
            }

            return {
              success: true,
              message: `Seeder "${params.name}" completed successfully`,
              data: stat,
            };
          } catch (error) {
            return {
              success: false,
              message: `Error running seeder "${params.name}"`,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
        {
          detail: {
            tags: ['Seeder'],
            summary: 'Run specific seeder',
            description: 'Execute a specific seeder by name',
          },
        },
      )

      // Rollback specific seeder
      .post(
        '/rollback/:name',
        async ({ params }) => {
          try {
            await runner.rollbackSeeder(params.name);

            return {
              success: true,
              message: `Seeder "${params.name}" rolled back successfully`,
            };
          } catch (error) {
            return {
              success: false,
              message: `Error rolling back seeder "${params.name}"`,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
        {
          detail: {
            tags: ['Seeder'],
            summary: 'Rollback specific seeder',
            description: 'Rollback a specific seeder by name (if rollback function is defined)',
          },
        },
      )

      // Rollback all seeders
      .post(
        '/rollback-all',
        async () => {
          try {
            await runner.rollbackAll();

            return {
              success: true,
              message: 'All seeders rolled back successfully',
            };
          } catch (error) {
            return {
              success: false,
              message: 'Rollback failed',
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
        {
          detail: {
            tags: ['Seeder'],
            summary: 'Rollback all seeders',
            description:
              'Rollback all seeders in reverse execution order (only seeders with rollback functions)',
          },
        },
      )

      // Get seeder details
      .get(
        '/:name',
        async ({ params }) => {
          const seeder = seederRegistry.getSeeder(params.name);

          if (!seeder) {
            return {
              success: false,
              message: `Seeder "${params.name}" not found`,
            };
          }

          return {
            success: true,
            data: {
              name: params.name,
              description: seeder.config.description,
              priority: seeder.config.priority ?? 100,
              dependencies: seeder.config.dependencies || [],
              hasRollback: !!seeder.rollback,
            },
          };
        },
        {
          detail: {
            tags: ['Seeder'],
            summary: 'Get seeder details',
            description: 'Get detailed information about a specific seeder',
          },
        },
      )
  );
};
