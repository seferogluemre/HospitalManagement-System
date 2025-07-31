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