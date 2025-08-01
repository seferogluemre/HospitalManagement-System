import type { AppointmentStatus } from "@onlyjs/db/enums";

export interface AppointmentCreatePayload {
  patientId: string;
  doctorId: number;
  appointmentDate: Date;
  status?: AppointmentStatus;
  description?: string;
  notes?: string;
  createdBySecretaryId?: number;
}

export interface AppointmentUpdatePayload {
  appointmentDate?: Date;
  status?: AppointmentStatus;
  description?: string;
  notes?: string;
  completedAt?: Date;
}

// Query filters
export interface AppointmentIndexQuery {
  page?: string;
  limit?: string;
  search?: string;
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  clinicId?: string;
}

// Show where condition
export interface AppointmentShowWhere {
  uuid: string;
}