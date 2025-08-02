import { AI_CONSTANTS } from "#modules/treatments/constants/constants.ts";
import type { ITreatmentAIResponse } from "../types";

export class ResponseParserService {

  static parseAIResponse(rawResponse: string): {
    success: boolean;
    data?: ITreatmentAIResponse;
    error?: string;
    validation?: ITreatmentValidationResult;
  } {
    try {
      const parsed = this.extractJSON(rawResponse);
      if (!parsed) {
        return {
          success: false,
          error: 'AI yanıtında geçerli JSON bulunamadı'
        };
      }

      const validation = this.validateTreatmentResponse(parsed);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Eksik alanlar: ${validation.missingFields.join(', ')}`,
          validation
        };
      }

      return {
        success: true,
        data: parsed as ITreatmentAIResponse,
        validation
      };

    } catch (error) {
      return {
        success: false,
        error: `Parse hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      };
    }
  }


  private static extractJSON(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
          if (codeBlockMatch) {
            return JSON.parse(codeBlockMatch[1]);
          }
        }
      }
      return null;
    }
  }

  private static validateTreatmentResponse(data: any): ITreatmentValidationResult {
    const requiredFields = AI_CONSTANTS.REQUIRED_FIELDS;
    const missingFields: string[] = [];
    const issues: string[] = [];

    for (const field of requiredFields) {
      if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
        missingFields.push(field);
      }
    }

    if (data.diagnosis && data.diagnosis.length < 10) {
      issues.push('Tanı çok kısa');
    }

    if (data.treatment && data.treatment.length < 10) {
      issues.push('Tedavi önerisi çok kısa');
    }

    const isEmergency = this.containsEmergencyKeywords(data.diagnosis + ' ' + data.treatment);
    let quality: 'high' | 'medium' | 'low' = 'high';
    if (missingFields.length > 0) {
      quality = 'low';
    } else if (issues.length > 0) {
      quality = 'medium';
    }

    let confidence = 100;
    confidence -= missingFields.length * 25; 
    confidence -= issues.length * 10;       
    confidence = Math.max(0, confidence);

    return {
      isValid: missingFields.length === 0,
      quality,
      issues,
      confidence,
      requiredFields,
      missingFields
    };
  }

  private static containsEmergencyKeywords(text: string): boolean {
    const emergencyKeywords = [
      'acil', 'hemen', '112', 'ambulans', 'hastane', 
      'derhal', 'ivedi', 'tehlike', 'kritik'
    ];
    
    const lowerText = text.toLowerCase();
    return emergencyKeywords.some(keyword => lowerText.includes(keyword));
  }

  static cleanResponse(data: ITreatmentAIResponse): ITreatmentAIResponse {
    return {
      diagnosis: this.cleanText(data.diagnosis),
      treatment: this.cleanText(data.treatment),
      recommendations: this.cleanText(data.recommendations),
      followUp: this.cleanText(data.followUp),
      warnings: data.warnings?.map(w => this.cleanText(w))
    };
  }

  private static cleanText(text: string): string {
    return text
      .replace(/^\s+|\s+$/g, '')      // Başta/sondaki boşluklar
      .replace(/\s+/g, ' ')           // Çoklu boşlukları tek boşluğa
      .replace(/[\r\n\t]+/g, ' ')     // Enter/tab'ları boşluğa
      .replace(/[""'']/g, '"')        // Farklı tırnak türlerini standartlaştır
      .trim();
  }

  static summarizeResponse(data: ITreatmentAIResponse): {
    diagnosisLength: number;
    treatmentLength: number;
    hasWarnings: boolean;
    totalLength: number;
    keyTopics: string[];
  } {
    const allText = `${data.diagnosis} ${data.treatment} ${data.recommendations} ${data.followUp}`;
    
    return {
      diagnosisLength: data.diagnosis.length,
      treatmentLength: data.treatment.length,
      hasWarnings: !!(data.warnings && data.warnings.length > 0),
      totalLength: allText.length,
      keyTopics: this.extractKeyTopics(allText)
    };
  }

  private static extractKeyTopics(text: string): string[] {
    const medicalKeywords = [
      'ağrı', 'ateş', 'baş', 'karın', 'göğüs', 'nefes', 'kalp',
      'ilaç', 'tedavi', 'istirahat', 'doktor', 'kontrol', 'test'
    ];
    
    const lowerText = text.toLowerCase();
    return medicalKeywords.filter(keyword => lowerText.includes(keyword));
  }
}