export interface IAIRequest {
    prompt: string;
    context?: Record<string, any>;
    temperature?: number;
    maxTokens?: number;
}

export interface IAIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: {
        model: string;
        usage?: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
        };
        processingTime: number;
        requestId: string;
    };
}

export interface IAIClient {
    generateContent(request: IAIRequest): Promise<IAIResponse>;
    isHealthy(): Promise<boolean>;
    getModelInfo(): string;
}

export interface IAIServiceStatus {
    status: 'healthy' | 'unhealthy' | 'degraded';
    lastChecked: Date;
    errorMessage?: string;
    responseTime?: number;
}

export interface IAIClientConfig {
    apiKey: string;
    apiUrl: string;
    timeout: number;
    maxRetries: number;
    model: string;
}

export enum AIErrorType {
    NETWORK_ERROR = 'network_error',
    API_ERROR = 'api_error',
    RATE_LIMIT = 'rate_limit',
    INVALID_REQUEST = 'invalid_request',
    INVALID_RESPONSE = 'invalid_response',
    TIMEOUT = 'timeout',
    UNKNOWN = 'unknown'
}

export interface IAIError {
    type: AIErrorType;
    message: string;
    originalError?: any;
    statusCode?: number;
    retryAfter?: number;
}