import type { Doctor, Patient, User } from "@onlyjs/db/client";

export interface MedicalRecordCreatePayload {
  patientId: number;
  doctorId: number;
  description: string;
}

export interface MedicalRecordUpdatePayload {
  description?: string;
}

export interface MedicalRecordIndexQuery {
  page?: string;
  limit?: string;
  search?: string;
  doctorId?: number;
  patientId?: number;
}

export interface MedicalRecordShowWhere {
  uuid: string;
}

export interface MedicalRecordWithRelations {
  uuid: string;
  id: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  patient: Pick<Patient, "id" | "uuid"> & {
    user: Pick<User, "firstName" | "lastName" | "email">;
  };
  doctor: Pick<Doctor, "id" | "specialty"> & {
    user: Pick<User, "firstName" | "lastName" | "email">;
  };
}