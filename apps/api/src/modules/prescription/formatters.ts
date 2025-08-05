import type { PrescriptionWithRelations } from "./types";

export abstract class PrescriptionFormatter {
    static response(prescription: PrescriptionWithRelations) {
        return {
            uuid: prescription.uuid,
            content: prescription.content,
            isActive: prescription.isActive,
            createdAt: prescription.createdAt,
            updatedAt: prescription.updatedAt,
            appointment: {
                id: prescription.appointment.id,
                uuid: prescription.appointment.uuid,
                appointmentDate: prescription.appointment.appointmentDate,
                status: prescription.appointment.status,
                notes: prescription.appointment.notes,
            },
            doctor: {
                id: prescription.doctor.id,
                specialty: prescription.doctor.specialty,
                user: {
                    firstName: prescription.doctor.user.firstName,
                    lastName: prescription.doctor.user.lastName,
                    email: prescription.doctor.user.email,
                },
            },
        };
    }
}
