import { cache } from '#core';
import { InternalServerErrorException } from '../../utils';
import { SeedersService } from './seeders';

export class SystemAdministrationService {
  static async resetDatabase() {
    if (process.env.NODE_ENV !== 'development') {
      throw new InternalServerErrorException(
        "Bu işlem sadece development environment'ında kullanılabilir.",
      );
    }

    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      // Prisma migrate reset komutunu çalıştır
      const { stdout, stderr } = await execAsync(
        'bun prisma migrate reset --force --skip-generate --skip-seed',
        {
          cwd: process.cwd(),
          env: process.env,
        },
      );

      console.info('Prisma migrate reset output:', stdout);
      if (stderr) {
        console.warn('Prisma migrate reset warnings:', stderr);
      }

      // Redis cache'i temizle
      await cache.flushAll();

      await SeedersService.setupInitial();

      return {
        success: true,
        message:
          'Veritabanı ve Redis cache başarıyla sıfırlandı. Prisma migrate reset komutu çalıştırıldı.',
        timestamp: new Date().toISOString(),
        output: stdout,
      };
    } catch (error) {
      console.error('Database reset error:', error);
      throw new InternalServerErrorException(
        'Veritabanı sıfırlanırken hata oluştu: ' +
          (error instanceof Error ? error.message : 'Bilinmeyen hata'),
      );
    }
  }
}
