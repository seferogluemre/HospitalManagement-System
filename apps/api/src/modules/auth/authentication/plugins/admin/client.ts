import type { BetterAuthClientPlugin } from 'better-auth/types';
import type { admin } from './index';

export const adminClient = () => {
  return {
    id: 'better-auth-admin-client',
    $InferServerPlugin: {} as ReturnType<typeof admin>,
    pathMethods: {
      '/admin/stop-impersonating': 'POST',
    },
  } satisfies BetterAuthClientPlugin;
};
