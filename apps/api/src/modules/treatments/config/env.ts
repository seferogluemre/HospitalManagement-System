export const AIConfig = {
    GEMINI: {
        apiKey: process.env.GEMINI_API_KEY!,
        apiUrl: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        timeout: parseInt(process.env.GEMINI_TIMEOUT || '30000'),
        maxRetries: parseInt(process.env.GEMINI_MAX_RETRIES || '3'),
        model: 'gemini-1.5-flash',
    }
} as const;

export function validateAIConfig(): void {
    // Çevre değişkenlerini kontrol et
    console.log("ENV Variables Check:", {
        GEMINI_API_KEY_EXISTS: !!process.env.GEMINI_API_KEY,
        GEMINI_API_URL_EXISTS: !!process.env.GEMINI_API_URL
    });

    if (!AIConfig.GEMINI.apiKey) {
        console.error("GEMINI_API_KEY missing in AIConfig");
        throw new Error('GEMINI_API_KEY is required in environment variables');
    }

    if (!AIConfig.GEMINI.apiUrl) {
        console.error("GEMINI_API_URL missing in AIConfig");
        throw new Error('GEMINI_API_URL is required in environment variables');
    }
}

export interface IAIConfig {
    readonly GEMINI: {
        readonly apiKey: string;
        readonly apiUrl: string;
        readonly timeout: number;
        readonly maxRetries: number;
        readonly model: string;
    };
}