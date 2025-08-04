import { AIReportService } from '../ai/services/ai-report.service';
import { TreatmentService as BaseTreatmentService } from '../service';
import type {
  TreatmentCreatePayload,
  TreatmentUpdatePayload
} from '../types';

export abstract class TreatmentService {
  static async createWithAI(payload: TreatmentCreatePayload & {
    patientComplaint: string;
    patientAge?: number;
    patientGender?: 'male' | 'female' | 'other';
    symptoms?: string[];
    allergies?: string[];
    doctorNotes?: string;
  }) {
    try {
      const aiReport = await AIReportService.generateReport({
        patientComplaint: payload.patientComplaint,
        patientAge: payload.patientAge,
        patientGender: payload.patientGender,
        symptoms: payload.symptoms,
        allergies: payload.allergies,
        doctorNotes: payload.doctorNotes
      });

      const treatmentData: TreatmentCreatePayload = {
        title: payload.title,
        notes: payload.doctorNotes,
        diagnosis: aiReport.aiResponse?.diagnosis || "",
        appointmentId: payload.appointmentId,
        doctorId: payload.doctorId,
        patientComplaint: payload.patientComplaint,
        aiTreatment: aiReport.aiResponse?.treatment || "",
        aiRecommendations: aiReport.aiResponse?.recommendations || "",
        aiFollowUp: aiReport.aiResponse?.followUp || "",
        aiStatus: aiReport.aiStatus
      };

      const treatment = await BaseTreatmentService.store(treatmentData);

      console.log("AI Response Raw Data:", JSON.stringify(aiReport.aiResponse, null, 2));
      console.log("Treatment Data Before Store:", JSON.stringify(treatmentData, null, 2));
      console.log("Treatment AI Sonuç:", JSON.stringify({
        treatmentId: treatment.id,
        treatmentUuid: treatment.uuid,
        aiGenerated: aiReport.success,
        aiConfidence: aiReport.confidence,
        aiStatus: aiReport.aiStatus,
        aiResponseFields: {
          diagnosis: !!aiReport.aiResponse?.diagnosis,
          treatment: !!aiReport.aiResponse?.treatment,
          recommendations: !!aiReport.aiResponse?.recommendations,
          followUp: !!aiReport.aiResponse?.followUp
        }
      }, null, 2));

      return {
        treatment,
        aiGenerated: aiReport.success,
        aiConfidence: aiReport.confidence,
        aiStatus: aiReport.aiStatus
      };

    } catch (error) {
      throw error;
    }
  }

  static async regenerateAIReport(uuid: string) {
    try {
      const existingTreatment = await BaseTreatmentService.show({ uuid });
      
      if (!existingTreatment.patientComplaint) {
        return {
          success: false,
          treatment: undefined,
          error: "Hasta şikayeti bulunamadı"
        };
      }

      const aiReport = await AIReportService.generateReport({
        patientComplaint: existingTreatment.patientComplaint
      });

      const updateData: TreatmentUpdatePayload = {
        diagnosis: aiReport.aiResponse?.diagnosis || "",
        patientComplaint: existingTreatment.patientComplaint,
        aiTreatment: aiReport.aiResponse?.treatment || "",
        aiRecommendations: aiReport.aiResponse?.recommendations || "",
        aiFollowUp: aiReport.aiResponse?.followUp || "",
        aiStatus: aiReport.aiStatus
      };

      const updatedTreatment = await BaseTreatmentService.update(uuid, updateData);

      return {
        success: aiReport.success,
        treatment: updatedTreatment,
        error: aiReport.error
      };

    } catch (error) {
      return {
        success: false,
        treatment: undefined,
        error: error instanceof Error ? error.message : "Bilinmeyen hata"
      };
    }
  }

  
  static async reviewAIReport(uuid: string, reviewData: {
    approved: boolean;
    aiReviewNotes?: string;
    updatedDiagnosis?: string;
    updatedTreatment?: string;
  }) {
    try {
      const updateData: TreatmentUpdatePayload = {
        diagnosis: reviewData.updatedDiagnosis
      };

      return await BaseTreatmentService.update(uuid, updateData);
    } catch (error) {
      throw error;
    }
  }

  static async getAIStats() {
    try {
      return {
        totalAIReports: 0,
        approvedReports: 0,
        pendingReports: 0,
        rejectedReports: 0,
        averageConfidence: 0
      };
    } catch (error) {
      throw error;
    }
  }
}