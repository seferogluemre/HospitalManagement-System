export const AIConfig = {
    GEMINI: {
        API_KEY: process.env.GEMINI_API_KEY!,
        API_URL: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        TIMEOUT: parseInt(process.env.GEMINI_TIMEOUT || '30000'),
        MAX_RETRIES: parseInt(process.env.GEMINI_MAX_RETRIES || '3'),
        MODEL: 'gemini-1.5-flash',
    }
} as const;

export function validateAIConfig(): void {
    if (!AIConfig.GEMINI.API_KEY) {
        throw new Error('GEMINI_API_KEY is required in environment variables');
    }

    if (!AIConfig.GEMINI.API_URL) {
        throw new Error('GEMINI_API_URL is required in environment variables');
    }
}

export interface IAIConfig {
    readonly GEMINI: {
        readonly API_KEY: string;
        readonly API_URL: string;
        readonly TIMEOUT: number;
        readonly MAX_RETRIES: number;
        readonly MODEL: string;
    };
}