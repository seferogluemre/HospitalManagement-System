/**
 * 🎯 Single Source of Truth for all seeders in the monorepo
 * Dynamic imports of all seeder functions from each application
 */

// @ts-ignore
import { loadApiSeeders } from '../../../apps/api/src/seeders';
import type { Seeder } from '../src/seeder/interfaces';

// Future app imports:
// import { loadAdminSeeders } from '../../../apps/admin/src/seeders';
// import { loadMobileApiSeeders } from '../../../apps/mobile-api/src/seeders';

// 🎯 Central seeder loader - dynamically load all seeders
export async function loadAllSeeders(): Promise<Seeder[]> {
  const allSeeders: Seeder[] = [];

  try {
    const apiSeeders = await loadApiSeeders();
    allSeeders.push(...apiSeeders);
  } catch (error) {
    console.warn('⚠️ Failed to load API seeders:', error);
  }

  // Future apps can be loaded here:
  // try {
  //   const adminSeeders = await loadAdminSeeders();
  //   allSeeders.push(...adminSeeders);
  // } catch (error) {
  //   console.warn('⚠️ Failed to load admin seeders:', error);
  // }

  return allSeeders;
}
