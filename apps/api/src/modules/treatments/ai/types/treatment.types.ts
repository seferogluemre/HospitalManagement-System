export interface ITreatmentAIRequest {
  patientComplaint: string;
  symptoms?: string[];
  medicalHistory?: string;
  currentMedications?: string[];
  allergies?: string[];
  age?: number;
  gender?: "male" | "female" | "other";
  additionalNotes?: string;
}


export interface ITreatmentAIResponse {
  diagnosis: string;
  treatment: string;
  recommendations: string;
  followUp: string;
  warnings?: string[];
}

export enum AITreatmentStatus {
  GENERATED = "generated",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface ITreatmentRecord {
  id: number;
  uuid: string;
  title: string;
  notes?: string;
  diagnosis?: string;

  patientComplaint?: string;
  aiTreatment?: string;
  aiRecommendations?: string;
  aiFollowUp?: string;
  aiStatus?: string;
  aiReviewedAt?: Date;
  aiReviewNotes?: string;

  doctorId: number;
  appointmentId: string;

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ITreatmentPromptContext {
  patientInfo: {
    age?: number;
    gender?: string;
    medicalHistory?: string;
    allergies?: string[];
    currentMedications?: string[];
  };
  complaint: {
    primary: string;
    symptoms: string[];
    duration?: string;
    severity?: "mild" | "moderate" | "severe";
  };
  doctorNotes?: string;
}
