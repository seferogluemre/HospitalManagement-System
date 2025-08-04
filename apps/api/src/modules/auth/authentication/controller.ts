import prisma from '@onlyjs/db';
import { type Context, Elysia, NotFoundError } from 'elysia';
import { UserFormatter } from '../../users';
import { getUserPermissions } from '../roles';
import { betterAuth } from './instance';
import { auth, authSwagger } from './plugin';

const app = new Elysia({
  prefix: '/auth',
  detail: {
    tags: ['Auth'],
  },
})
  .guard(authSwagger, (app) =>
    app.use(auth()).get(
      '/me',
      async ({ user }) => {
        const fullUser = await prisma.user.findUnique({
          where: {
            id: user.id,
          },
        });
        if (!fullUser) {
          throw new NotFoundError('User not found');
        }

        // Kullanıcının permission'larını al
        const permissions = await getUserPermissions(fullUser);

        // Standart user response'una permission'ları ekle
        const userResponse = UserFormatter.response(fullUser);
        return {
          ...userResponse,
          permissions,
        };
      },
      {
        detail: {
          summary: 'Me (Current User)',
        },
      },
    ),
  )
  // Handle better-auth requests
  .all('*', async (context: Context) => {
    const BETTER_AUTH_ACCEPT_METHODS = ['POST', 'GET'];
    // validate request method
    if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
      const response = await betterAuth.handler(context.request);

      if (!response.ok) {
        if (!response.headers.get('Content-Type')) {
          response.headers.set('Content-Type', 'application/json');
        }
      }
      
      return response;
    } else {
      context.error(405);
    }
  });

export default app;
