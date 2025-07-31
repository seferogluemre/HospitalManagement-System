import type { Role } from '@onlyjs/db/client';
import { RolePlain } from '@onlyjs/db/prismabox/Role';
import { BaseFormatter } from '../../../utils';

export abstract class RoleFormatter {
  static response(data: Role) {
    const convertedData = BaseFormatter.convertData<typeof RolePlain.static>(data, RolePlain);
    return convertedData;
  }
}
