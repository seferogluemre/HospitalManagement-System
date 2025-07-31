import { createSeeder } from '@onlyjs/db/seeder/utils';
import { SeedersService } from '../modules/system-administration/seeders';

const systemAdminSeeder = createSeeder(
  {
    name: 'system-admin',
    description: 'Sistem yöneticisi kullanıcısını oluşturur',
    priority: 1, // En önce çalışacak
  },
  async (prisma) => {
    await SeedersService.setupInitial();
    console.log('✅ System admin user created!');
  },
);

export default systemAdminSeeder;
