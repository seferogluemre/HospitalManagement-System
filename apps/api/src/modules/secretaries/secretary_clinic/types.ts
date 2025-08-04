import type { Clinic, Secretary, SecretaryClinic, User } from "@onlyjs/db/client";

export interface SecretaryClinicCreatePayload {
  secretaryUuid: string;
  clinicUuid: string;
}

export interface SecretaryClinicUpdatePayload {
  secretaryUuid?: string;
  clinicUuid?: string;
}

export interface SecretaryClinicIndexQuery {
  page?: string;
  limit?: string;
  search?: string;
  secretaryUuid?: string;
  clinicUuid?: string;
}

export interface SecretaryClinicShowWhere {
  id: number;
}

export type SecretaryClinicWithRelations = SecretaryClinic & {
  secretary: Secretary & {
    user: Pick<User, "id" | "firstName" | "lastName" | "email">;
  };
  clinic: Pick<Clinic, "id" | "uuid" | "name">;
};