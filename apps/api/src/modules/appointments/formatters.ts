import type { Appointment } from "@onlyjs/db/client";

type AppointmentWithRelations = Appointment & {
  patient: {
    uuid: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      tcNo: string;
    };
    phoneNumber: string | null;
  };
  doctor: {
    id: number;
    uuid: string;
    specialty: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    clinic: {
      uuid: string;
      name: string;
    };
  };
  createdBySecretary?: {
    uuid: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;
};

export abstract class AppointmentFormatter {
  static response(appointment: AppointmentWithRelations) {
    return {
      id: appointment.id,
      uuid: appointment.uuid,
      appointmentDate: appointment.appointmentDate,
      status: appointment.status,
      description: appointment.description ?? null,
      notes: appointment.notes ?? null,
      completedAt: appointment.completedAt ?? null,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      patient: {
        uuid: appointment.patient.uuid,
        fullName: `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`,
        email: appointment.patient.user.email,
        tcNo: appointment.patient.user.tcNo,
        phoneNumber: appointment.patient.phoneNumber,
      },
      doctor: {
        id: appointment.doctor.id,
        uuid: appointment.doctor.uuid,
        specialty: appointment.doctor.specialty,
        fullName: `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`,
        email: appointment.doctor.user.email,
        clinic: {
          uuid: appointment.doctor.clinic.uuid,
          name: appointment.doctor.clinic.name,
        },
      },
      createdBySecretary: appointment.createdBySecretary
        ? {
            uuid: appointment.createdBySecretary.uuid,
            fullName: `${appointment.createdBySecretary.user.firstName} ${appointment.createdBySecretary.user.lastName}`,
            email: appointment.createdBySecretary.user.email,
          }
        : null,
    };
  }
}
