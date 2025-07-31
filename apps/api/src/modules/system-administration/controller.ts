import { Elysia } from 'elysia';
import { auditLogsController } from '../audit-logs';
import { dtoWithPermission, PERMISSIONS } from '../auth';
import { UserFormatter } from '../users';
import { initialSetupDto, resetDatabaseDto } from './dto';
import { SeedersService } from './seeders';
import { SystemAdministrationService } from './service';

const app = new Elysia({
  prefix: '/system-administration',
  detail: {
    tags: ['System Administration'],
  },
})
  .use(auditLogsController)
  .post(
    '/initial',
    async () => {
      const payload = await SeedersService.setupInitial();
      return { user: UserFormatter.response(payload.user) };
    },
    initialSetupDto,
  )
  .post(
    '/reset-database',
    async () => {
      const result = await SystemAdministrationService.resetDatabase();
      return result;
    },
    dtoWithPermission(resetDatabaseDto, PERMISSIONS.SYSTEM_ADMINISTRATION.RESET_DATABASE),
  );

export default app;
