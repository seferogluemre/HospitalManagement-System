import type { PatientWithAppointments, PatientWithRelations } from "./types";

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
      familyDoctor: patient.familyDoctor
        ? {
            id: patient.familyDoctor.id,
            specialty: patient.familyDoctor.specialty,
            user: patient.familyDoctor.user
              ? {
                  firstName: patient.familyDoctor.user.firstName,
                  lastName: patient.familyDoctor.user.lastName,
                }
              : undefined,
          }
        : null,
    };
  }

  static withAppointments(patientWithAppointments: PatientWithAppointments) {
    return {
      ...this.response(patientWithAppointments),
      appointments: patientWithAppointments.appointments.map((appointment) => ({
        id: appointment.id,
        uuid: appointment.uuid,
        appointmentDate: appointment.appointmentDate,
        status: appointment.status,
        description: appointment.description,
        notes: appointment.notes,
        completedAt: appointment.completedAt,
        patient: {
          id: appointment.patient.id,
          user: {
            firstName: appointment.patient.user.firstName,
            lastName: appointment.patient.user.lastName,
            email: appointment.patient.user.email,
            gender: appointment.patient.user.gender,
          },
        },
        doctor: {
          id: appointment.doctor.id,
          user: {
            firstName: appointment.doctor.user.firstName,
            lastName: appointment.doctor.user.lastName,
            email: appointment.doctor.user.email,
            gender: appointment.doctor.user.gender,
          },
        },
      })),
    };
  }
}
