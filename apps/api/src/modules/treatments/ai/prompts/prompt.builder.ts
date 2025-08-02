import { TreatmentPromptTemplate } from './treatment-prompt.template';
import type { ITreatmentPromptContext } from '../types';

export class PromptBuilderService {

    static buildTreatmentPrompt(context: ITreatmentPromptContext): string {
        if (TreatmentPromptTemplate.checkEmergencyKeywords(context.complaint.primary)) {
            return this.buildEmergencyPrompt(context);
        }

        return this.buildNormalPrompt(context);
    }


    private static buildNormalPrompt(context: ITreatmentPromptContext): string {
        const parts = [
            TreatmentPromptTemplate.SYSTEM_ROLE,
            TreatmentPromptTemplate.buildPatientContext(context.patientInfo),
            TreatmentPromptTemplate.buildComplaintSection(context.complaint),
            this.buildDoctorNotesSection(context.doctorNotes),
            TreatmentPromptTemplate.SAFETY_GUIDELINES,
            TreatmentPromptTemplate.RESPONSE_FORMAT
        ];

        return parts.filter(Boolean).join('\n\n');
    }

    private static buildEmergencyPrompt(context: ITreatmentPromptContext): string {
        return [
            TreatmentPromptTemplate.buildPatientContext(context.patientInfo),
            TreatmentPromptTemplate.buildComplaintSection(context.complaint),
            TreatmentPromptTemplate.buildEmergencyPrompt()
        ].join('\n\n');
    }


    private static buildDoctorNotesSection(notes?: string): string {
        if (!notes) return '';

        return `DOKTOR NOTLARI:\n${notes}`;
    }


    static validatePromptLength(prompt: string): {
        isValid: boolean;
        length: number;
        maxLength: number;
    } {
        const maxLength = 4000;

        return {
            isValid: prompt.length <= maxLength,
            length: prompt.length,
            maxLength
        };
    }


    static previewPrompt(context: ITreatmentPromptContext): {
        prompt: string;
        sections: {
            hasPatientInfo: boolean;
            hasComplaint: boolean;
            hasDoctorNotes: boolean;
            isEmergency: boolean;
        };
        validation: {
            isValid: boolean;
            length: number;
        };
    } {
        const prompt = this.buildTreatmentPrompt(context);
        const validation = this.validatePromptLength(prompt);

        return {
            prompt,
            sections: {
                hasPatientInfo: !!(context.patientInfo.age || context.patientInfo.gender),
                hasComplaint: !!context.complaint.primary,
                hasDoctorNotes: !!context.doctorNotes,
                isEmergency: TreatmentPromptTemplate.checkEmergencyKeywords(context.complaint.primary)
            },
            validation
        };
    }
}