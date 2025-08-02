export interface TreatmentCreatePayload {
  title: string;
  notes?: string;
  diagnosis?: string;
  appointmentId: string;
  doctorId: number;
  patientComplaint?: string;
  aiTreatment?: string;
  aiRecommendations?: string;
  aiFollowUp?: string;
  aiStatus?: string;
  aiReviewNotes?: string;
}

export interface TreatmentUpdatePayload {
  title?: string;
  notes?: string;
  diagnosis?: string;
  // AI Fields
  patientComplaint?: string;
  aiTreatment?: string;
  aiRecommendations?: string;
  aiFollowUp?: string;
  aiStatus?: string;
  aiReviewedAt?: Date;
  aiReviewNotes?: string;
}

// Query filters
export interface TreatmentIndexQuery {
  page?: string;
  limit?: string;
  search?: string;
  doctorId?: string;
  appointmentId?: string;
  aiStatus?: string;
}

export interface TreatmentShowWhere {
  uuid: string;
}