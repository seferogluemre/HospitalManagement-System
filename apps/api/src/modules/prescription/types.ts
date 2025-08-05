import type { Appointment, Doctor, User } from "@onlyjs/db/client";

export interface PrescriptionCreatePayload {
  appointmentId: number;
  doctorId: number;
  content: string;
  isActive?: boolean;
}

export interface PrescriptionUpdatePayload {
  content?: string;
  isActive?: boolean;
}

export interface PrescriptionIndexQuery {
  page?: string;
  limit?: string;
  search?: string;
  doctorId?: number;
  appointmentId?: number;
  isActive?: boolean;
}

export interface PrescriptionShowWhere {
  uuid: string;
}

export interface PrescriptionWithRelations {
  uuid: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  appointment: Pick<Appointment, "id" | "uuid" | "appointmentDate" | "status" | "notes">;
  doctor: Pick<Doctor, "id" | "specialty"> & {
    user: Pick<User, "firstName" | "lastName" | "email">;
  };
}