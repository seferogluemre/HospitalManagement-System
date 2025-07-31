import { createAuthClient } from 'better-auth/react';
import { env } from '#config/env.ts';

export const authClient = createAuthClient({
  baseURL: env.apiUrl,
  basePath: '/auth',
}) as ReturnType<typeof createAuthClient>;
