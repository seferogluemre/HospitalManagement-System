import type { User } from '@onlyjs/db/client';
import type { Context } from 'elysia';

export interface AuthContext extends Context {
  user: User;
}
