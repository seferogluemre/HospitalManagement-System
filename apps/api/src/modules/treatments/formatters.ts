export abstract class TreatmentFormatter {
  static response(treatment: any) {
    return {
      id: treatment.id,
      uuid: treatment.uuid,
      title: treatment.title,
      notes: treatment.notes || null,
      diagnosis: treatment.diagnosis || null,
      
      patientComplaint: treatment.patientComplaint || null,
      aiTreatment: treatment.aiTreatment || null,
      aiRecommendations: treatment.aiRecommendations || null,
      aiFollowUp: treatment.aiFollowUp || null,
      aiConfidence: treatment.aiConfidence || null,
      aiStatus: treatment.aiStatus || null,
      aiReviewedAt: treatment.aiReviewedAt || null,
      aiReviewNotes: treatment.aiReviewNotes || null,
      
      createdAt: treatment.createdAt,
      updatedAt: treatment.updatedAt,
      
      doctor: {
        id: treatment.doctor.id,
        uuid: treatment.doctor.uuid,
        specialty: treatment.doctor.specialty,
        user: {
          firstName: treatment.doctor.user.firstName,
          lastName: treatment.doctor.user.lastName,
          email: treatment.doctor.user.email,
        },
        clinic: treatment.doctor.clinic ? {
          uuid: treatment.doctor.clinic.uuid,
          name: treatment.doctor.clinic.name,
        } : null,
      },
      appointment: {
        uuid: treatment.appointment.uuid,
        appointmentDate: treatment.appointment.appointmentDate,
        patient: {
          uuid: treatment.appointment.patient.uuid,
          user: {
            firstName: treatment.appointment.patient.user.firstName,
            lastName: treatment.appointment.patient.user.lastName,
          },
        },
      },
    };
  }

  static aiSummary(treatment: any) {
    return {
      uuid: treatment.uuid,
      title: treatment.title,
      aiStatus: treatment.aiStatus,
      aiConfidence: treatment.aiConfidence,
      aiReviewedAt: treatment.aiReviewedAt,
      diagnosis: treatment.diagnosis,
      aiTreatment: treatment.aiTreatment,
      aiRecommendations: treatment.aiRecommendations,
      aiFollowUp: treatment.aiFollowUp,
    };
  }

  
  static simple(treatment: any) {
    return {
      uuid: treatment.uuid,
      title: treatment.title,
      aiStatus: treatment.aiStatus,
      createdAt: treatment.createdAt,
      doctor: {
        name: `${treatment.doctor.user.firstName} ${treatment.doctor.user.lastName}`,
        specialty: treatment.doctor.specialty,
      },
      patient: {
        name: `${treatment.appointment.patient.user.firstName} ${treatment.appointment.patient.user.lastName}`,
      },
    };
  }
}