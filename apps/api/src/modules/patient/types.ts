import type { Appointment, Doctor, Patient, User } from "@onlyjs/db/client";
import type { Gender } from "@onlyjs/db/enums";

export interface PatientCreatePayload {
  firstName: string;
  lastName: string;
  email: string;
  tcNo: string;
  gender: Gender;

  // Patient specific fields
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;
  familyDoctorId?: number;
}

export interface PatientUpdatePayload {
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;
  familyDoctorId?: number;
}

export interface PatientIndexQuery {
  page?: string;
  limit?: string;
  search?: string;
  familyDoctorId?: number;
}

export interface PatientShowWhere {
  id: string;
}

export type PatientWithRelations = Patient & {
  user: Pick<
    User,
    "id" | "firstName" | "lastName" | "email" | "tcNo" | "gender"
  >;
  familyDoctor?: Pick<Doctor, "id" | "specialty"> | null;
};

export type PatientWithAppointments = PatientWithRelations & {
  appointments: Array<
    Appointment & {
      patient: {
        id: number;
        user: Pick<User, "firstName" | "lastName" | "email" | "gender">;
      };
      doctor: {
        id: number;
        user: Pick<User, "firstName" | "lastName" | "email" | "gender">;
      };
    }
  >;
};
