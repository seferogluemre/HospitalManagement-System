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
  CLINICS: {
    READ: { key: 'clinics:read', description: 'Klinikleri Listele ve Görüntüle' },
    SHOW: { key: 'clinics:show', description: 'Klinikleri Görüntüle' },
    CREATE: { key: 'clinics:create', description: 'Klinik Oluştur' },
    UPDATE: { key: 'clinics:update', description: 'Klinik Güncelle' },
    DESTROY: { key: 'clinics:destroy', description: 'Klinik Sil' },
    RESTORE: { key: 'clinics:restore', description: 'Klinik Geri Yükle', isHidden: true },
  },
  APPOINTMENTS: {
    READ: { key: 'appointments:read', description: 'Randevuları Listele ve Görüntüle' },
    SHOW: { key: 'appointments:show', description: 'Randevuları Görüntüle' },
    CREATE: { key: 'appointments:create', description: 'Randevu Oluştur' },
    UPDATE: { key: 'appointments:update', description: 'Randevu Güncelle' },
    DESTROY: { key: 'appointments:destroy', description: 'Randevu Sil' },
  },
  ANNOUNCEMENTS: {
    READ: { key: 'announcements:read', description: 'Duyuruları Listele ve Görüntüle' },
    SHOW: { key: 'announcements:show', description: 'Duyuruları Görüntüle' },
    CREATE: { key: 'announcements:create', description: 'Duyuru Oluştur' },
    UPDATE: { key: 'announcements:update', description: 'Duyuru Güncelle' },
    DESTROY: { key: 'announcements:destroy', description: 'Duyuru Sil' },
  },
  TREATMENTS: {   
    READ: { key: 'treatments:read', description: 'Tedavileri Listele ve Görüntüle' },
    SHOW: { key: 'treatments:show', description: 'Tedavileri Görüntüle' },
    CREATE: { key: 'treatments:create', description: 'Tedavi Oluştur' },
    UPDATE: { key: 'treatments:update', description: 'Tedavi Güncelle' },
    DESTROY: { key: 'treatments:destroy', description: 'Tedavi Sil' },
  },
  PRESCRIPTIONS: {
    READ: { key: 'prescriptions:read', description: 'Reçeteleri Listele ve Görüntüle' },
    SHOW: { key: 'prescriptions:show', description: 'Reçeteleri Görüntüle' },
    CREATE: { key: 'prescriptions:create', description: 'Reçete Oluştur' },
    UPDATE: { key: 'prescriptions:update', description: 'Reçete Güncelle' },
    DESTROY: { key: 'prescriptions:destroy', description: 'Reçete Sil' },
  },
  MEDICAL_RECORDS: {  
    READ: { key: 'medical-records:read', description: 'Tıbbi Kayıtları Listele ve Görüntüle' },
    SHOW: { key: 'medical-records:show', description: 'Tıbbi Kayıtları Görüntüle' },
    CREATE: { key: 'medical-records:create', description: 'Tıbbi Kayıt Oluştur' },
    UPDATE: { key: 'medical-records:update', description: 'Tıbbi Kayıt Güncelle' },
    DESTROY: { key: 'medical-records:destroy', description: 'Tıbbi Kayıt Sil' },
  },
  SECRETARIES: {
    READ: { key: 'secretaries:read', description: 'Sekreterleri Listele ve Görüntüle' },
    SHOW: { key: 'secretaries:show', description: 'Sekreterleri Görüntüle' },
    CREATE: { key: 'secretaries:create', description: 'Sekreter Oluştur' },
    UPDATE: { key: 'secretaries:update', description: 'Sekreter Güncelle' },
    DESTROY: { key: 'secretaries:destroy', description: 'Sekreter Sil' },
  },
  SECRETARY_CLINICS: {  
    SHOW: { key: 'secretary-clinics:show', description: 'Sekreter Kliniklerini Görüntüle' },
    CREATE: { key: 'secretary-clinics:create', description: 'Sekreter Kliniklerini Oluştur' },
    UPDATE: { key: 'secretary-clinics:update', description: 'Sekreter Kliniklerini Güncelle' },
    DESTROY: { key: 'secretary-clinics:destroy', description: 'Sekreter Kliniklerini Sil' },
  },
  DOCTORS: {
    READ: { key: 'doctors:read', description: 'Doktorları Listele ve Görüntüle' },
    SHOW: { key: 'doctors:show', description: 'Doktorları Görüntüle' },
    CREATE: { key: 'doctors:create', description: 'Doktor Oluştur' },
    UPDATE: { key: 'doctors:update', description: 'Doktor Güncelle' },
    DESTROY: { key: 'doctors:destroy', description: 'Doktor Sil' },
  },
  PATIENTS: {
    READ: { key: 'patients:read', description: 'Hastaları Listele ve Görüntüle' },
    SHOW: { key: 'patients:show', description: 'Hasta Görüntüle' },
    CREATE: { key: 'patients:create', description: 'Hasta Oluştur' },
    UPDATE: { key: 'patients:update', description: 'Hasta Güncelle' },
    DESTROY: { key: 'patients:destroy', description: 'Hasta Sil' },
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
  CLINICS: {
    key: 'clinics',
    description: 'Klinikler',
    permissions: Object.values(PERMISSIONS.CLINICS),
  },
  APPOINTMENTS: {
    key: 'appointments',
    description: 'Randevular',
    permissions: Object.values(PERMISSIONS.APPOINTMENTS),
  },
  ANNOUNCEMENTS: {
    key: 'announcements',
    description: 'Duyurular',
    permissions: Object.values(PERMISSIONS.ANNOUNCEMENTS),
  },
  TREATMENTS: {
    key: 'treatments',
    description: 'Tedaviler',
    permissions: Object.values(PERMISSIONS.TREATMENTS),
  },
  PRESCRIPTIONS: {
    key: 'prescriptions',
    description: 'Reçeteler',
    permissions: Object.values(PERMISSIONS.PRESCRIPTIONS),
  },
  MEDICAL_RECORDS: {
    key: 'medical-records',
    description: 'Tıbbi Kayıtlar',
    permissions: Object.values(PERMISSIONS.MEDICAL_RECORDS),
  },
  SECRETARIES: {
    key: 'secretaries',
    description: 'Sekreterler',
    permissions: Object.values(PERMISSIONS.SECRETARIES),
  },
  DOCTORS: {
    key: 'doctors',
    description: 'Doktorlar',
    permissions: Object.values(PERMISSIONS.DOCTORS),
  },
  PATIENTS: {
    key: 'patients',
    description: 'Hastalar',
    permissions: Object.values(PERMISSIONS.PATIENTS),
  },
  SECRETARY_CLINICS: {
    key: 'secretary-clinics',
    description: 'Sekreter Klinikleri',
    permissions: Object.values(PERMISSIONS.SECRETARY_CLINICS),
  },
} as const satisfies Record<
  string,
  { key: string; description: string; permissions: Array<{ key: string; description: string }> }
>;