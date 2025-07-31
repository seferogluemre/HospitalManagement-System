import { type ControllerHook, dtoWithMiddlewares, ForbiddenException } from '../../../utils';
import type { AuthContext } from '../authentication/types';
import { isPermissionGrantedToUser } from './helpers';
import type { PermissionIdentifier } from './types';

export function withPermission(permission?: PermissionIdentifier) {
  return {
    beforeHandle: async ({ user, set }: AuthContext) => {
      if (!permission) return;

      const userHasPermission = await isPermissionGrantedToUser(user, permission);

      if (!userHasPermission) {
        const exception = new ForbiddenException('Bu işlem için yetkiniz yok');
        set.status = exception.statusCode;
        set.headers = {
          'Content-Type': 'application/json',
        };

        return exception;
      }
    },
  };
}

export function dtoWithPermission<T extends ControllerHook>(
  hook: T,
  permission?: PermissionIdentifier,
): T {
  return dtoWithMiddlewares(hook, withPermission(permission));
}
