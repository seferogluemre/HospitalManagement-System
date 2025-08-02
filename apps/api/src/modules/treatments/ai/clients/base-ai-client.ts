import { type IAIRequest, type IAIResponse, type IAIClient, type IAIServiceStatus, type IAIError, AIErrorType } from '../types';

export abstract class BaseAIClient implements IAIClient {
  protected config: {
    apiKey: string;
    apiUrl: string;
    timeout: number;
    maxRetries: number;
    model: string;
  };

  constructor(config: {
    apiKey: string;
    apiUrl: string;
    timeout: number;
    maxRetries: number;
    model: string;
  }) {
    this.config = config;
    this.validateConfig();
  }
  
  abstract generateContent(request: IAIRequest): Promise<IAIResponse>;
 
  async isHealthy(): Promise<boolean> {
    try {
      const testRequest: IAIRequest = {
        prompt: "Test",
        maxTokens: 10
      };
      
      const response = await this.generateContent(testRequest);
      return response.success;
    } catch (error) {
      console.error(`${this.getModelInfo()} health check failed:`, error);
      return false;
    }
  }

  getModelInfo(): string {
    return this.config.model;
  }

 
  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error(`API key is required for ${this.getModelInfo()}`);
    }
    
    if (!this.config.apiUrl) {
      throw new Error(`API URL is required for ${this.getModelInfo()}`);
    }
  }


  protected async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.config.maxRetries
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === retries) {
          throw this.createAIError(error);
        }
        
        const waitTime = this.isRateLimitError(error) 
          ? Math.pow(2, attempt) * 2000  // 4, 8, 16 saniye
          : Math.pow(2, attempt) * 500;  // 1, 2, 4 saniye
          
        console.warn(`${this.getModelInfo()} attempt ${attempt} failed, retrying in ${waitTime}ms...`);
        await this.sleep(waitTime);
      }
    }
    
    throw this.createAIError(lastError);
  }

  protected async makeRequest(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      
      throw error;
    }
  }
 
  protected createAIError(error: any): IAIError {
    if (error?.status === 429) {
      return {
        type: AIErrorType.RATE_LIMIT,
        message: 'AI service rate limit exceeded',
        originalError: error,
        statusCode: 429,
        retryAfter: error.retryAfter || 60
      };
    }
    
    if (error?.status >= 400 && error?.status < 500) {
      return {
        type: AIErrorType.API_ERROR,
        message: `AI service API error: ${error.message}`,
        originalError: error,
        statusCode: error.status
      };
    }
    
    if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
      return {
        type: AIErrorType.TIMEOUT,
        message: 'AI service request timeout',
        originalError: error
      };
    }
    
    if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
      return {
        type: AIErrorType.NETWORK_ERROR,
        message: 'AI service network error',
        originalError: error
      };
    }
    
    return {
      type: AIErrorType.UNKNOWN,
      message: `AI service unknown error: ${error?.message || 'Unknown error'}`,
      originalError: error
    };
  }

  protected isRateLimitError(error: any): boolean {
    return error?.status === 429 || 
           error?.message?.toLowerCase().includes('rate limit') ||
           error?.message?.toLowerCase().includes('quota exceeded');
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getServiceStatus(): Promise<IAIServiceStatus> {
    const startTime = Date.now();
    
    try {
      const isHealthy = await this.isHealthy();
      const responseTime = Date.now() - startTime;
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        lastChecked: new Date(),
        responseTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }
}