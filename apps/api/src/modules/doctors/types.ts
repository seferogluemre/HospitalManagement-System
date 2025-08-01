import type { Appointment, Doctor, User } from "@onlyjs/db/client";
import type { Gender } from "@onlyjs/db/enums";

export interface DoctorCreatePayload {
  firstName: string;
  lastName: string;
  email: string;
  tcNo: string;
  gender: Gender;

  // Doctor specific fields
  clinicId:number;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;
  specialty: string;
}

export interface DoctorUpdatePayload {
  clinicId?: number;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;
  specialty?: string;
}

export interface DoctorIndexQuery {
  page?: string;
  limit?: string;
  search?: string;
  specialty?: string;
}

export interface DoctorShowWhere {
  uuid: string;
}

export type DoctorWithRelations = Doctor & {
  user: Pick<
    User,
    "id" | "firstName" | "lastName" | "email" | "tcNo" | "gender"
  >;
};

export type DoctorWithAppointments = DoctorWithRelations & {
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