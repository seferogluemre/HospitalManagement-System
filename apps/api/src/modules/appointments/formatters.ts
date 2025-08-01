export abstract class AppointmentFormatter {
  static response(appointment: any) {
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
        user: {
          firstName: appointment.patient.user.firstName,
          lastName: appointment.patient.user.lastName,
          email: appointment.patient.user.email,
          tcNo: appointment.patient.user.tcNo,
        },
        phoneNumber: appointment.patient.phoneNumber ?? undefined,
      },
      doctor: {
        id: appointment.doctor.id,
        uuid: appointment.doctor.uuid,
        specialty: appointment.doctor.specialty,
        user: {
          firstName: appointment.doctor.user.firstName,
          lastName: appointment.doctor.user.lastName,
          email: appointment.doctor.user.email,
        },
        clinic: {
          uuid: appointment.doctor.clinic.uuid,
          name: appointment.doctor.clinic.name,
        },
      },
      createdBySecretary: appointment.createdBySecretary
        ? {
            uuid: appointment.createdBySecretary.uuid,
            user: {
              firstName: appointment.createdBySecretary.user.firstName,
              lastName: appointment.createdBySecretary.user.lastName,
              email: appointment.createdBySecretary.user.email,
            },
          }
        : undefined,
    };
  }
}
