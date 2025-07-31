import { t } from 'elysia';
import { type ControllerHook, errorResponseDto } from '../../utils';
import { userResponseSchema } from '../users/dtos';

// Controller Hooks
export const initialSetupDto = {
  response: {
    200: t.Object({
      user: userResponseSchema,
    }),
    410: errorResponseDto[410],
  },
  detail: {
    summary: 'Initial System Setup',
    description: 'Creates the first admin user and role',
  },
} satisfies ControllerHook;

export const resetDatabaseDto = {
  response: {
    200: t.Object({
      success: t.Boolean(),
      message: t.String(),
      timestamp: t.String(),
      output: t.String(),
    }),
    500: errorResponseDto[500],
  },
  detail: {
    summary: 'Reset Database',
    description: 'Completely resets the database using prisma migrate reset command',
  },
} satisfies ControllerHook;
