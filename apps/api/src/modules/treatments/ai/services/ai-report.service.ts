import { AITreatmentStatus, type ITreatmentAIResponse, type ITreatmentPromptContext } from "../types";
import { AIOrchestratorService } from "./ai-orchestrator.service";

export class AIReportService {
 
  static async generateReport(data: {
    patientComplaint: string;
    patientAge?: number;
    patientGender?: 'male' | 'female' | 'other';
    symptoms?: string[];
    medicalHistory?: string;
    allergies?: string[];
    currentMedications?: string[];
    doctorNotes?: string;
  }): Promise<{
    success: boolean;
    aiResponse?: ITreatmentAIResponse;
    aiStatus: AITreatmentStatus;
    processingTime: number;
    confidence: number;
    error?: string;
  }> {
    try {
      const validation = this.validateInput(data);
      if (!validation.isValid) {
        return {
          success: false,
          aiStatus: AITreatmentStatus.REJECTED,
          processingTime: 0,
          confidence: 0,
          error: validation.error
        };
      }

      const context = this.buildPromptContext(data);

      console.log("AI Rapor Talebi:", JSON.stringify(context, null, 2));
      const aiResult = await AIOrchestratorService.generateTreatmentReport(context);
      console.log("AI Rapor Sonucu:", JSON.stringify({
        success: aiResult.success,
        hasData: !!aiResult.data,
        error: aiResult.error || null,
        metadata: aiResult.metadata || null
      }, null, 2));

      if (!aiResult.success || !aiResult.data) {
        return {
          success: false,
          aiStatus: AITreatmentStatus.REJECTED,
          processingTime: aiResult.metadata?.processingTime || 0,
          confidence: 0,
          error: aiResult.error || 'AI raporu oluşturulamadı'
        };
      }

      const qualityCheck = await this.checkReportQuality(aiResult.data);
      const aiStatus = this.determineAIStatus(qualityCheck.confidence);

      return {
        success: true,
        aiResponse: aiResult.data,
        aiStatus,
        processingTime: aiResult.metadata?.processingTime || 0,
        confidence: qualityCheck.confidence,
      };

    } catch (error) {
      return {
        success: false,
        aiStatus: AITreatmentStatus.REJECTED,
        processingTime: 0,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
    }
  }


  private static validateInput(data: any): { isValid: boolean; error?: string } {
    if (!data.patientComplaint || data.patientComplaint.trim().length < 5) {
      return { isValid: false, error: 'Hasta şikayeti en az 5 karakter olmalıdır' };
    }

    if (data.patientComplaint.length > 2000) {
      return { isValid: false, error: 'Hasta şikayeti çok uzun (max 2000 karakter)' };
    }

    const dangerousWords = ['öldür', 'zarar ver', 'intihara'];
    const lowerComplaint = data.patientComplaint.toLowerCase();
    for (const word of dangerousWords) {
      if (lowerComplaint.includes(word)) {
        return { isValid: false, error: 'Uygunsuz içerik tespit edildi' };
      }
    }

    return { isValid: true };
  }

 
  private static buildPromptContext(data: any): ITreatmentPromptContext {
    return {
      patientInfo: {
        age: data.patientAge,
        gender: data.patientGender,
        medicalHistory: data.medicalHistory,
        allergies: data.allergies || [],
        currentMedications: data.currentMedications || []
      },
      complaint: {
        primary: data.patientComplaint,
        symptoms: data.symptoms || [],
        duration: this.extractDuration(data.patientComplaint),
        severity: this.extractSeverity(data.patientComplaint)
      },
      doctorNotes: data.doctorNotes
    };
  }

  private static extractDuration(complaint: string): string | undefined {
    const durationPatterns = [
      /(\d+)\s*(gün|day)/i,
      /(\d+)\s*(hafta|week)/i,
      /(\d+)\s*(ay|month)/i,
      /(dün|yesterday)/i,
      /(bugün|today)/i
    ];

    for (const pattern of durationPatterns) {
      const match = complaint.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return undefined;
  }


  private static extractSeverity(complaint: string): 'mild' | 'moderate' | 'severe' | undefined {
    const lowerComplaint = complaint.toLowerCase();
    
    if (lowerComplaint.includes('çok şiddetli') || lowerComplaint.includes('dayanılmaz')) {
      return 'severe';
    }
    
    if (lowerComplaint.includes('şiddetli') || lowerComplaint.includes('kötü')) {
      return 'moderate';
    }
    
    if (lowerComplaint.includes('hafif') || lowerComplaint.includes('az')) {
      return 'mild';
    }

    return undefined;
  }

  private static async checkReportQuality(response: ITreatmentAIResponse): Promise<{
    confidence: number;
    issues: string[];
  }> {
    const qualityResult = await AIOrchestratorService.evaluateResponseQuality(response);
    
    return {
      confidence: qualityResult.score,
      issues: qualityResult.issues
    };
  }


  private static determineAIStatus(confidence: number): AITreatmentStatus {
    if (confidence >= 80) {
      return AITreatmentStatus.GENERATED; 
    } else if (confidence >= 60) {
      return AITreatmentStatus.UNDER_REVIEW;
    } else {
      return AITreatmentStatus.REJECTED; 
    }
  }

 
  static async checkAIHealth(): Promise<{
    isHealthy: boolean;
    status: string;
    responseTime?: number;
  }> {
    return await AIOrchestratorService.checkAIHealth();
  }

  static async generateBatchReports(
    requests: Array<{
      patientComplaint: string;
      patientAge?: number;
      doctorNotes?: string;
    }>
  ): Promise<Array<{
    index: number;
    success: boolean;
    aiResponse?: ITreatmentAIResponse;
    error?: string;
  }>> {
    const contexts = requests.map(req => this.buildPromptContext(req));
    return await AIOrchestratorService.generateBatchReports(contexts);
  }

 
  static getAIModelInfo(): {
    model: string;
    version: string;
    capabilities: string[];
  } {
    return {
      model: 'Google Gemini',
      version: '1.5-flash',
      capabilities: [
        'Tedavi önerisi',
        'Tanı desteği', 
        'Takip önerisi',
        'Genel sağlık tavsiyeleri'
      ]
    };
  }
}