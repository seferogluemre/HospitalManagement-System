import type { DoctorWithAppointments, DoctorWithRelations } from "./types";

export abstract class DoctorFormatter {
  static response(doctor: DoctorWithRelations) {
    return {
      id: doctor.id,
      uuid: doctor.uuid,
      phoneNumber: doctor.phoneNumber ?? null,
      address: doctor.address ?? null,
      dateOfBirth: doctor.dateOfBirth ?? null,
      specialty: doctor.specialty ?? null,
      createdAt: doctor.createdAt ?? null,
      updatedAt: doctor.updatedAt ?? null,
      user: {
        id: doctor.user.id,
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        email: doctor.user.email,
        tcNo: doctor.user.tcNo,
        gender: doctor.user.gender,
      },
    };
  }

  static withAppointments(doctorWithAppointments: DoctorWithAppointments) {
    return {
      ...this.response(doctorWithAppointments),
      appointments: doctorWithAppointments.appointments.map((appointment) => ({
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