import type { GenericPermissionObject, PermissionKey } from './types';

export const PERMISSIONS = {
  USERS: {
    SHOW: { key: 'users:show', description: 'Kullanıcıları Görüntüle' },
    UPDATE: { key: 'users:update', description: 'Kullanıcı Güncelle' },
    DESTROY: { key: 'users:destroy', description: 'Kullanıcı Sil' },
    CREATE: { key: 'users:create', description: 'Kullanıcı Oluştur' },
    BAN: { key: 'users:ban', description: 'Kullanıcı Yasakla', isHidden: true },
    UNBAN: { key: 'users:unban', description: 'Kullanıcı Yasağını Kaldır', isHidden: true },
    UPDATE_ROLES: { key: 'users:update-roles', description: 'Kullanıcı Rollerini Güncelle' },
    UNLINK_USER: {
      key: 'users:unlink',
      description: 'Kullanıcıyı Bağlantıdan Kaldır',
      isHidden: true,
    },
    LINK_USER: { key: 'users:link', description: 'Kullanıcıyı Bağla', isHidden: true },
    LIST_SESSIONS: {
      key: 'users:list-sessions',
      description: 'Oturumları Listele',
      isHidden: true,
    },
    REVOKE_SESSIONS: {
      key: 'users:revoke-sessions',
      description: 'Oturumları İptal Et',
      isHidden: true,
    },
    IMPERSONATE: { key: 'users:impersonate', description: 'Kullanıcıyı Taklit Et', isHidden: true },
  },
  ROLES: {
    SHOW: { key: 'roles:show', description: 'Rolleri Görüntüle' },
    UPDATE: { key: 'roles:update', description: 'Rolleri Güncelle' },
  },
  SYSTEM_ADMINISTRATION: {
    SHOW_LOGS: { key: 'system-administration:show-logs', description: 'Logları Görüntüle' },
    RESET_DATABASE: {
      key: 'system-administration:reset-database',
      description: 'Veritabanını Sıfırla',
      isHidden: true,
    },
    SEED_DATA: {
      key: 'system-administration:seed-data',
      description: "Veritabanını Seed'le",
      isHidden: true,
    },
  },
  POSTS: {
    SHOW: { key: 'posts:show', description: 'Gönderileri Görüntüle' },
    CREATE: { key: 'posts:create', description: 'Gönderi Oluştur' },
    UPDATE: { key: 'posts:update', description: 'Gönderi Güncelle' },
    DESTROY: { key: 'posts:destroy', description: 'Gönderi Sil' },
  },
  FILE_LIBRARY_ASSETS: {
    SHOW: { key: 'file-library-assets:show', description: 'Dosya Görüntüle', isHidden: true },
    CREATE: { key: 'file-library-assets:create', description: 'Dosya Oluştur', isHidden: true },
    UPDATE: { key: 'file-library-assets:update', description: 'Dosya Güncelle', isHidden: true },
    DESTROY: { key: 'file-library-assets:destroy', description: 'Dosya Sil', isHidden: true },
  },
} as const satisfies Record<string, Record<string, GenericPermissionObject>>;

export const PERMISSION_KEYS = [
  ...new Set(
    Object.values(PERMISSIONS)
      .flatMap((module) => Object.values(module))
      .flatMap((permission) => permission.key),
  ),
] as PermissionKey[];

export const PERMISSION_GROUPS = {
  USERS: {
    key: 'users',
    description: 'Kullanıcılar',
    permissions: Object.values(PERMISSIONS.USERS),
  },
  ROLES: {
    key: 'roles',
    description: 'Roller',
    permissions: Object.values(PERMISSIONS.ROLES),
  },
  SYSTEM_ADMINISTRATION: {
    key: 'system-administration',
    description: 'Sistem Yönetimi',
    permissions: Object.values(PERMISSIONS.SYSTEM_ADMINISTRATION),
  },
  POSTS: {
    key: 'posts',
    description: 'Gönderiler',
    permissions: Object.values(PERMISSIONS.POSTS),
  },
  FILE_LIBRARY_ASSETS: {
    key: 'file-library-assets',
    description: 'Dosya Yönetimi',
    permissions: Object.values(PERMISSIONS.FILE_LIBRARY_ASSETS),
  },
} as const satisfies Record<
  string,
  { key: string; description: string; permissions: Array<{ key: string; description: string }> }
>;
