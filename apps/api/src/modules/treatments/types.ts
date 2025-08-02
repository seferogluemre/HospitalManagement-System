export interface TreatmentCreatePayload {
  title: string;
  notes?: string;
  diagnosis?: string;
  appointmentId: string;
  doctorId: number;
}

export interface TreatmentUpdatePayload {
  title?: string;
  notes?: string;
  diagnosis?: string;
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

// Show where condition
export interface TreatmentShowWhere {
  uuid: string;
}