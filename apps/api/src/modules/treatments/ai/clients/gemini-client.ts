import type {
  IAIRequest,
  IAIResponse,
  IGeminiErrorResponse,
  IGeminiRequest,
  IGeminiResponse
} from '../types';
import { BaseAIClient } from './base-ai-client';

export class GeminiClient extends BaseAIClient {
  constructor(config: {
    apiKey: string;
    apiUrl: string;
    timeout: number;
    maxRetries: number;
    model: string;
  }) {
    super(config);
  }

  async generateContent(request: IAIRequest): Promise<IAIResponse> {
    return this.withRetry(async () => {
      const geminiRequest = this.buildGeminiRequest(request);
      const response = await this.callGeminiAPI(geminiRequest);
      return this.parseGeminiResponse(response);
    });
  }

  private buildGeminiRequest(request: IAIRequest): IGeminiRequest {
    return {
      contents: [
        {
          parts: [
            {
              text: request.prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: request.temperature || 0.8,
        maxOutputTokens: request.maxTokens || 1000,
        topK: 40,
        topP: 0.95
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };
  }


  private async callGeminiAPI(request: IGeminiRequest): Promise<IGeminiResponse> {
    const url = `${this.config.apiUrl}?key=${this.config.apiKey}`;
    
    const response = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(request)
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as IGeminiErrorResponse;
      throw new Error(`Gemini API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    return data as IGeminiResponse;
  }

  private parseGeminiResponse(geminiResponse: IGeminiResponse): IAIResponse {
    try {
      const text = candidate.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No text content in Gemini response');
      }

      return {
        success: true,
        data: text,
        metadata: {
          model: this.config.model,
          usage: geminiResponse.usageMetadata
            ? {
                promptTokens: geminiResponse.usageMetadata.promptTokenCount,
                completionTokens: geminiResponse.usageMetadata.candidatesTokenCount,
                totalTokens: geminiResponse.usageMetadata.totalTokenCount
              }
            : undefined,
          processingTime: 0, 
          requestId: geminiResponse.responseId
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  override getModelInfo(): string {
    return `Gemini (${this.config.model})`;
  }
}