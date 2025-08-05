import { GoneException } from '#utils';
import prisma from '@onlyjs/db';
import { Gender } from '@onlyjs/db/enums';
import { RolesService } from '../auth';
import { PERMISSIONS } from '../auth/roles/constants';
import { UsersService } from '../users';

export class SeedersService {
  static async setupInitial() {
    const usersCount = await prisma.user.count();

    if (usersCount > 0) {
      throw new GoneException('Halihazırda bir kullanıcı olduğu için kullanıcı kaydı yapılamaz');
    }

    // Admin rolünü oluştur
    const adminRole = await RolesService.store({
      name: 'Admin',
      description: 'Sistem yöneticisi',
      permissions: ['*'], // Tüm yetkiler
      slug: 'admin',
    });

    await RolesService.store({
      name: 'Basic',
      description: 'Temel kullanıcı',
      permissions: [],
      slug: 'basic',
    });

    // Secretary rolünü oluştur
    await RolesService.store({
      name: 'Secretary',
      description: 'Sekreter - Klinik ve hasta yönetimi yapabilir',
      permissions: [
        // Kliniklerle ilgili tüm işlemler
        PERMISSIONS.CLINICS.READ.key,
        PERMISSIONS.CLINICS.CREATE.key,
        PERMISSIONS.CLINICS.UPDATE.key,
        PERMISSIONS.CLINICS.DESTROY.key,
        
        // Doktorlarla ilgili tüm işlemler
        PERMISSIONS.DOCTORS.READ.key,
        PERMISSIONS.DOCTORS.CREATE.key,
        PERMISSIONS.DOCTORS.UPDATE.key,
        
        // Hastalarla ilgili tüm işlemler
        PERMISSIONS.PATIENTS.READ.key,
        PERMISSIONS.PATIENTS.CREATE.key,
        PERMISSIONS.PATIENTS.UPDATE.key,
        
        // Randevularla ilgili tüm işlemler
        PERMISSIONS.APPOINTMENTS.READ.key,
        PERMISSIONS.APPOINTMENTS.CREATE.key,
        PERMISSIONS.APPOINTMENTS.UPDATE.key,
        PERMISSIONS.APPOINTMENTS.DESTROY.key,
        
        // Duyurularla ilgili tüm işlemler
        PERMISSIONS.ANNOUNCEMENTS.READ.key,
        PERMISSIONS.ANNOUNCEMENTS.CREATE.key,
        PERMISSIONS.ANNOUNCEMENTS.UPDATE.key,
        PERMISSIONS.ANNOUNCEMENTS.DESTROY.key,
        
        // Reçeteler - hasta reçetelerini yönetme
        PERMISSIONS.PRESCRIPTIONS.READ.key,
        PERMISSIONS.PRESCRIPTIONS.CREATE.key,
        PERMISSIONS.PRESCRIPTIONS.UPDATE.key,
        
        // Tedaviler - hasta tedavilerini görüntüleme
        PERMISSIONS.TREATMENTS.READ.key,
        
        // Tıbbi kayıtlar - görüntüleme
        PERMISSIONS.MEDICAL_RECORDS.READ.key,
        
        // Kendi bilgilerini yönetme
        PERMISSIONS.SECRETARIES.READ.key,
        PERMISSIONS.SECRETARIES.UPDATE.key,
        
        // Sekreter-klinik ilişkileri - tüm işlemler
        PERMISSIONS.SECRETARY_CLINICS.SHOW.key,
        PERMISSIONS.SECRETARY_CLINICS.CREATE.key,
        PERMISSIONS.SECRETARY_CLINICS.UPDATE.key,
        PERMISSIONS.SECRETARY_CLINICS.DESTROY.key,
      ],
      slug: 'secretary',
    });

    // Doctor rolünü oluştur
    await RolesService.store({
      name: 'Doctor',
      description: 'Doktor - Hasta muayene ve tedavi işlemleri yapabilir',
      permissions: [
        // Hastaları listeleme ve görüntüleme
        PERMISSIONS.PATIENTS.READ.key,
        
        // Randevuları görüntüle ve güncelle
        PERMISSIONS.APPOINTMENTS.READ.key,
        PERMISSIONS.APPOINTMENTS.UPDATE.key,
        
        // Tedavilerle ilgili tüm işlemler
        PERMISSIONS.TREATMENTS.READ.key,
        PERMISSIONS.TREATMENTS.CREATE.key,
        PERMISSIONS.TREATMENTS.UPDATE.key,
        PERMISSIONS.TREATMENTS.DESTROY.key,
        
        // Tıbbi kayıtlarla ilgili tüm işlemler
        PERMISSIONS.MEDICAL_RECORDS.READ.key,
        PERMISSIONS.MEDICAL_RECORDS.CREATE.key,
        PERMISSIONS.MEDICAL_RECORDS.UPDATE.key,
        PERMISSIONS.MEDICAL_RECORDS.DESTROY.key,
        
        // Reçetelerle ilgili tüm işlemler
        PERMISSIONS.PRESCRIPTIONS.READ.key,
        PERMISSIONS.PRESCRIPTIONS.CREATE.key,
        PERMISSIONS.PRESCRIPTIONS.UPDATE.key,
        PERMISSIONS.PRESCRIPTIONS.DESTROY.key,
        
        // Kendisine atanan duyuruları görüntüleme
        PERMISSIONS.ANNOUNCEMENTS.READ.key,
        
        // Kendi bilgilerini yönetme
        PERMISSIONS.DOCTORS.READ.key,
        PERMISSIONS.DOCTORS.UPDATE.key,
      ],
      slug: 'doctor',
    });

    // Patient rolünü oluştur
    await RolesService.store({
      name: 'Patient',
      description: 'Hasta - Kendi bilgilerini ve tedavi süreçlerini takip edebilir',
      permissions: [
        // Kendi randevularını görüntüleme
        PERMISSIONS.APPOINTMENTS.READ.key,
        
        // Kendi tıbbi kayıtlarını görüntüleme
        PERMISSIONS.MEDICAL_RECORDS.READ.key,
        
        // Kendi reçetelerini görüntüleme
        PERMISSIONS.PRESCRIPTIONS.READ.key,
        
        // Kendi tedavilerini görüntüleme
        PERMISSIONS.TREATMENTS.READ.key,
        
        // Kendisine atanan duyuruları görüntüleme
        PERMISSIONS.ANNOUNCEMENTS.READ.key,
        
        // Kendi bilgilerini yönetme
        PERMISSIONS.PATIENTS.READ.key,
        PERMISSIONS.PATIENTS.UPDATE.key,
        PERMISSIONS.PATIENTS.DESTROY.key,
      ],
      slug: 'patient',
    });

    // Admin kullanıcısını oluştur
    const user = await UsersService.store({
      password: 'password',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      rolesSlugs: [adminRole.slug],
      gender: Gender.MALE,
    });

    return {
      user,
    };
  }
}
