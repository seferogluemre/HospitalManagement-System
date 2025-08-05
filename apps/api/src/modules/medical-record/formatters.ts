import type { MedicalRecordWithRelations } from "./types";

export abstract class MedicalRecordFormatter {
    static response(medicalRecord: MedicalRecordWithRelations) {
        return {
            uuid: medicalRecord.uuid,
            id: medicalRecord.id,
            description: medicalRecord.description,
            createdAt: medicalRecord.createdAt.toISOString(),
            updatedAt: medicalRecord.updatedAt.toISOString(),
            patient: {
                id: medicalRecord.patient.id,
                uuid: medicalRecord.patient.uuid,
                user: {
                    firstName: medicalRecord.patient.user.firstName,
                    lastName: medicalRecord.patient.user.lastName,
                    email: medicalRecord.patient.user.email,
                },
            },
            doctor: {
                id: medicalRecord.doctor.id,
                specialty: medicalRecord.doctor.specialty,
                user: {
                    firstName: medicalRecord.doctor.user.firstName,
                    lastName: medicalRecord.doctor.user.lastName,
                    email: medicalRecord.doctor.user.email,
                },
            },
        };
    }
}