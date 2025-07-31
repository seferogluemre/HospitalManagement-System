import prisma from '@onlyjs/db';
import type { Role, User } from '@onlyjs/db/client';
import { cache } from '#core';
import { ForbiddenException, UnauthorizedException } from '#utils';
import type { PermissionIdentifier, PermissionKey } from './types';

const ROLE_CACHE_KEY = (slug: string) => `role:${slug}`;

export function isPermissionGrantedToRole(role: Role, permission: PermissionIdentifier) {
  const permissions = role.permissions as PermissionKey[];
  const permissionKey = typeof permission === 'string' ? permission : permission.key;
  return permissions.includes('*') || permissions.includes(permissionKey);
}

export async function isPermissionGrantedToUser(
  user: Pick<User, 'rolesSlugs'>,
  permission: PermissionIdentifier,
) {
  if (!user) {
    throw new UnauthorizedException();
  }

  for (const slug of user.rolesSlugs) {
    const cachedRole = await cache.get<Role>(ROLE_CACHE_KEY(slug));
    if (cachedRole && isPermissionGrantedToRole(cachedRole, permission)) {
      return true;
    }

    const role = await prisma.role.findUnique({
      where: { slug },
    });

    if (role) {
      await cache.set(ROLE_CACHE_KEY(slug), role, 3600); // 1 saat cache
      if (isPermissionGrantedToRole(role, permission)) {
        return true;
      }
    }
  }
  return false;
}

export function ensureRoleHasPermission(role: Role, permission?: PermissionIdentifier | null) {
  if (!permission) return;
  if (!isPermissionGrantedToRole(role, permission)) {
    throw new ForbiddenException('Bu işlem için yetkiniz yok');
  }
}

export async function ensureUserHasPermission(
  user: Pick<User, 'rolesSlugs'>,
  permission?: PermissionIdentifier | null,
) {
  if (!permission) return;

  const userHasPermission = await isPermissionGrantedToUser(user, permission);

  if (!userHasPermission) {
    throw new ForbiddenException('Bu işlem için yetkiniz yok');
  }
}

export async function getUserPermissions(user: Pick<User, 'rolesSlugs'>): Promise<PermissionKey[]> {
  if (!user) {
    throw new UnauthorizedException();
  }

  const permissions = new Set<PermissionKey>();

  for (const slug of user.rolesSlugs) {
    let role: Role | null = null;

    // Cache'den role'u almaya çalış
    const cachedRole = await cache.get<Role>(ROLE_CACHE_KEY(slug));
    if (cachedRole) {
      role = cachedRole;
    } else {
      // Cache'de yoksa veritabanından al
      role = await prisma.role.findUnique({
        where: { slug },
      });

      if (role) {
        await cache.set(ROLE_CACHE_KEY(slug), role, 3600); // 1 saat cache
      }
    }

    if (role) {
      const rolePermissions = role.permissions as PermissionKey[];

      // Eğer '*' permission'ı varsa tüm permission'ları ver
      if (rolePermissions.includes('*')) {
        // Tüm mevcut permission'ları ekle
        const { PERMISSION_KEYS } = await import('./constants');
        PERMISSION_KEYS.forEach((permission) => permissions.add(permission));
      } else {
        // Sadece role'a ait permission'ları ekle
        rolePermissions.forEach((permission) => permissions.add(permission));
      }
    }
  }

  return Array.from(permissions);
}
