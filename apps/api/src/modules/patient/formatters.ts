import type { Doctor, Patient, User } from "@onlyjs/db/client";

type PatientWithRelations = Patient & {
    user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'tcNo' | 'gender'>;
    familyDoctor?: Pick<Doctor, 'id' | 'specialty'> | null;
};

export abstract class PatientFormatter {
    static response(patient: PatientWithRelations) {
        return {
            id: patient.id,
            uuid: patient.uuid,
            phoneNumber: patient.phoneNumber,
            address: patient.address,
            dateOfBirth: patient.dateOfBirth,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
            user: {
                id: patient.user.id,
                firstName: patient.user.firstName,
                lastName: patient.user.lastName,
                email: patient.user.email,
                tcNo: patient.user.tcNo,
                gender: patient.user.gender,
            },
            familyDoctor: patient.familyDoctor ? {
                id: patient.familyDoctor.id,
                specialty: patient.familyDoctor.specialty,
            } : null,
        };
    }
}