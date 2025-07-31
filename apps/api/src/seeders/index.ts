// API Seeders - Dynamic Exports
// Tüm API seeder'ları dinamik import ile yüklenir (circular dependency önlemek için)

import type { Seeder } from '@onlyjs/db/seeder/interfaces';

// Dinamik import ile seeder'ları yükle
export async function loadApiSeeders(): Promise<Seeder[]> {
  const seeders: Seeder[] = [];

  try {
    const systemAdminModule = await import('./system-admin.seeder');
    seeders.push(systemAdminModule.default);
  } catch (error) {
    console.warn('⚠️ Failed to load system-admin seeder:', error);
  }

  try {
    const worldDataModule = await import('./world-data.seeder');
    seeders.push(worldDataModule.default);
  } catch (error) {
    console.warn('⚠️ Failed to load world-data seeder:', error);
  }

  try {
    const usersModule = await import('./users.seeder');
    seeders.push(usersModule.default);
  } catch (error) {
    console.warn('⚠️ Failed to load users seeder:', error);
  }

  return seeders.filter(Boolean);
}

// Legacy export - boş array (registry tarafında dinamik import kullanılmalı)
const apiSeeders: Seeder[] = [];
export default apiSeeders;
