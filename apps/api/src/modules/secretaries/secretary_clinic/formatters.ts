import type { SecretaryClinicWithRelations } from "./types";

export abstract class SecretaryClinicFormatter {
  static response(secretaryClinic: SecretaryClinicWithRelations) {
    return {
      id: secretaryClinic.id,
      secretary: {
        uuid: secretaryClinic.secretary.uuid,
        user: {
          firstName: secretaryClinic.secretary.user.firstName,
          lastName: secretaryClinic.secretary.user.lastName,
          email: secretaryClinic.secretary.user.email,
        },
      },
      clinic: {
        uuid: secretaryClinic.clinic.uuid,
        name: secretaryClinic.clinic.name,
      },
      createdAt: secretaryClinic.createdAt,
    };
  }
}
