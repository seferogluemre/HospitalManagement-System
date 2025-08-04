export interface IGeminiRequest {
    contents: IGeminiContent[];
    generationConfig?: IGeminiGenerationConfig;
    safetySettings?: IGeminiSafetySetting[];
}

export interface IGeminiContent {
    parts: IGeminiPart[];
    role?: 'user' | 'model';
}

export interface IGeminiPart {
    text: string;
}

export interface IGeminiGenerationConfig {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
}

export interface IGeminiSafetySetting {
    category: string;
    threshold: string;
}

export interface IGeminiResponse {
    responseId: string;
    candidates: IGeminiCandidate[];
    usageMetadata?: IGeminiUsageMetadata;
}
export interface IGeminiCandidate {
    content: IGeminiContent;
    finishReason?: string;
    index: number;
    safetyRatings?: IGeminiSafetyRating[];
}

export interface IGeminiUsageMetadata {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
}

export interface IGeminiSafetyRating {
    category: string;
    probability: string;
}

export interface IGeminiErrorResponse {
    error: {
        code: number;
        message: string;
        status: string;
        details?: any[];
    };
}