import type { PrismaClient } from '../../client/client';
import type { Seeder, SeederConfig } from './interfaces';

/**
 * Utility function to create a seeder with simplified syntax
 */
export const createSeeder = (
  config: SeederConfig,
  seedFn: (db: PrismaClient) => Promise<void>,
  rollbackFn?: (db: PrismaClient) => Promise<void>,
): Seeder => {
  return {
    config,
    seed: seedFn,
    rollback: rollbackFn,
  };
};

/**
 * Helper to create a simple seeder with just name and seed function
 */
export const simpleSeeder = (name: string, seedFn: (db: PrismaClient) => Promise<void>): Seeder => {
  return createSeeder({ name }, seedFn);
};

/**
 * Helper to create a seeder with description
 */
export const descriptiveSeeder = (
  name: string,
  description: string,
  seedFn: (db: PrismaClient) => Promise<void>,
  rollbackFn?: (db: PrismaClient) => Promise<void>,
): Seeder => {
  return createSeeder({ name, description }, seedFn, rollbackFn);
};

/**
 * Helper to create a prioritized seeder
 */
export const prioritySeeder = (
  name: string,
  priority: number,
  seedFn: (db: PrismaClient) => Promise<void>,
  rollbackFn?: (db: PrismaClient) => Promise<void>,
): Seeder => {
  return createSeeder({ name, priority }, seedFn, rollbackFn);
};

/**
 * Helper to create a seeder with dependencies
 */
export const dependentSeeder = (
  name: string,
  dependencies: string[],
  seedFn: (db: PrismaClient) => Promise<void>,
  rollbackFn?: (db: PrismaClient) => Promise<void>,
): Seeder => {
  return createSeeder({ name, dependencies }, seedFn, rollbackFn);
};

/**
 * Validate seeder configuration
 */
export const validateSeederConfig = (config: SeederConfig): string[] => {
  const errors: string[] = [];

  if (!config.name || config.name.trim() === '') {
    errors.push('Seeder name is required');
  }

  if (config.name && !/^[a-z0-9-]+$/.test(config.name)) {
    errors.push('Seeder name must contain only lowercase letters, numbers, and hyphens');
  }

  if (config.priority !== undefined && (config.priority < 0 || config.priority > 1000)) {
    errors.push('Priority must be between 0 and 1000');
  }

  if (config.dependencies) {
    if (!Array.isArray(config.dependencies)) {
      errors.push('Dependencies must be an array');
    } else {
      for (const dep of config.dependencies) {
        if (typeof dep !== 'string' || dep.trim() === '') {
          errors.push('All dependencies must be non-empty strings');
          break;
        }
      }
    }
  }

  return errors;
};

/**
 * Validate seeder structure
 */
export const validateSeeder = (seeder: any): string[] => {
  const errors: string[] = [];

  if (!seeder || typeof seeder !== 'object') {
    errors.push('Seeder must be an object');
    return errors;
  }

  if (!seeder.config) {
    errors.push('Seeder must have a config property');
  } else {
    errors.push(...validateSeederConfig(seeder.config));
  }

  if (!seeder.seed || typeof seeder.seed !== 'function') {
    errors.push('Seeder must have a seed function');
  }

  if (seeder.rollback && typeof seeder.rollback !== 'function') {
    errors.push('Rollback must be a function if provided');
  }

  return errors;
};
