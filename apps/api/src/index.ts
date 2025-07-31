import cors from '@elysiajs/cors';
import staticPlugin from '@elysiajs/static';
import swagger from '@elysiajs/swagger';
import { createSeederServer } from '@onlyjs/db/seeder/server';
import { Elysia } from 'elysia';
import path from 'path';
import { auth, authSwagger } from '#modules/auth/authentication/plugin';
import { loadEnv } from './config/env';
import { handleElysiaError } from './config/error-handler';
import { prepareSwaggerConfig } from './config/swagger.config';
import routes, { swaggerTags } from './modules';
import { PERMISSIONS } from './modules/auth';

loadEnv();

const seederServer = await createSeederServer({
  silent: true,
});

const app = new Elysia()
  .use(cors())
  .onError(handleElysiaError)
  .use(
    staticPlugin({
      assets: path.join(process.cwd(), 'public', 'storage'),
      prefix: '/storage',
    }),
  )
  .use(routes)
  .group('', (app) =>
    app.guard(authSwagger, (app) =>
      app.use(auth(PERMISSIONS.SYSTEM_ADMINISTRATION.SEED_DATA)).use(seederServer),
    ),
  )
  .listen(process.env.PORT ? parseInt(process.env.PORT) : 3000);

if (process.env.NODE_ENV === 'development') {
  const swaggerConfig = await prepareSwaggerConfig({ tags: swaggerTags });

  app.use(swagger(swaggerConfig));
}

console.log(
  `🦊 Elysia is running at ${app.server?.url.protocol}//${app.server?.hostname}:${app.server?.port} in ${process.env.NODE_ENV} mode`,
);

export type App = typeof app;
