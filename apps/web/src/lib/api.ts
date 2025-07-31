import { treaty } from '@onlyjs/eden';
import { env } from '#/config/env';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const api = treaty(env.apiUrl, {
  fetch: {
    credentials: 'include',
  },
  // This is a workaround to fix the type error
}) as ReturnType<typeof treaty>;
