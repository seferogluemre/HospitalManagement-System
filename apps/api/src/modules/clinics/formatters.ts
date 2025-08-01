
import type { Clinic } from "@onlyjs/db/client";

type ClinicWithRelations = Clinic & {
  doctors: {
    id: number;
    uuid: string;
    specialty: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
  secretaries: {
    id: number;
    secretary: {
      uuid: string;
      user: {
        firstName: string;
        lastName: string;
        email: string;
      };
    };
  }[];
};

export abstract class ClinicFormatter {
  static response(clinic: ClinicWithRelations) {
    return {
      id: clinic.id,
      uuid: clinic.uuid,
      name: clinic.name,
      description: clinic.description ?? null,
      phone: clinic.phone ?? null,
      address: clinic.address ?? null,
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt,
      doctors: clinic.doctors?.map(doctor => ({
        id: doctor.id,
        uuid: doctor.uuid,
        specialty: doctor.specialty,
        fullName: `${doctor.user.firstName} ${doctor.user.lastName}`,
        email: doctor.user.email,
      })) ?? [],
      secretaries: clinic.secretaries?.map(sec => ({
        id: sec.id,
        uuid: sec.secretary.uuid,
        fullName: `${sec.secretary.user.firstName} ${sec.secretary.user.lastName}`,
        email: sec.secretary.user.email,
      })) ?? [],
    };
  }
}