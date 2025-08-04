import { AIConfig, validateAIConfig } from "../../config";
import { GeminiClient } from "../clients";
import { PromptBuilderService } from "../prompts";
import type { ITreatmentAIResponse, ITreatmentPromptContext } from "../types";
import { ResponseParserService } from "./response-parser.service";

export class AIOrchestratorService {
  private static geminiClient: GeminiClient | null = null;

  private static getAIClient(): GeminiClient {
    if (!this.geminiClient) {
      try {
        validateAIConfig();

        this.geminiClient = new GeminiClient(AIConfig.GEMINI);
      } catch (error) {
        throw new Error(
          `AI Client initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
    return this.geminiClient;
  }

  static async generateTreatmentReport(
    context: ITreatmentPromptContext
  ): Promise<{
    success: boolean;
    data?: ITreatmentAIResponse;
    error?: string;
    metadata?: {
      processingTime: number;
      promptLength: number;
      responseLength: number;
      confidence: number;
      model: string;
    };
  }> {
    const startTime = Date.now();

    try {
      const prompt = PromptBuilderService.buildTreatmentPrompt(context);
      const promptValidation =
        PromptBuilderService.validatePromptLength(prompt);

      if (!promptValidation.isValid) {
        return {
          success: false,
          error: `Prompt çok uzun: ${promptValidation.length}/${promptValidation.maxLength} karakter`,
        };
      }

      const aiClient = this.getAIClient();
      const aiResponse = await aiClient.generateContent({
        prompt,
        temperature: 0.7,
        maxTokens: 1000,
      });

      if (!aiResponse.success || !aiResponse.data) {
        return {
          success: false,
          error: aiResponse.error || "AI servisinden yanıt alınamadı",
        };
      }

      const parseResult = ResponseParserService.parseAIResponse(
        aiResponse.data as string
      );
      if (!parseResult.success || !parseResult.data) {
        return {
          success: false,
          error: parseResult.error || "AI yanıtı parse edilemedi",
        };
      }

      const cleanedResponse = ResponseParserService.cleanResponse(
        parseResult.data
      );

      const processingTime = Date.now() - startTime;
      const metadata = {
        processingTime,
        promptLength: prompt.length,
        responseLength: aiResponse.data.length,
        confidence: parseResult.validation?.confidence || 0,
        model: aiClient.getModelInfo(),
      };

      return {
        success: true,
        data: cleanedResponse,
        metadata,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      return {
        success: false,
        error: this.handleAIError(error),
        metadata: {
          processingTime,
          promptLength: 0,
          responseLength: 0,
          confidence: 0,
          model: "unknown",
        },
      };
    }
  }

  static async checkAIHealth(): Promise<{
    isHealthy: boolean;
    status: string;
    responseTime?: number;
    error?: string;
  }> {
    try {
      const aiClient = this.getAIClient();
      const startTime = Date.now();

      const isHealthy = await aiClient.isHealthy();
      const responseTime = Date.now() - startTime;

      return {
        isHealthy,
        status: isHealthy ? "healthy" : "unhealthy",
        responseTime,
      };
    } catch (error) {
      return {
        isHealthy: false,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async generateBatchReports(
    contexts: ITreatmentPromptContext[]
  ): Promise<
    Array<{
      index: number;
      success: boolean;
      data?: ITreatmentAIResponse;
      error?: string;
    }>
  > {
    const results = [];

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    for (let i = 0; i < contexts.length; i++) {
      try {
        const result = await this.generateTreatmentReport(contexts[i]!);
        results.push({
          index: i,
          ...result,
        });

        if (i < contexts.length - 1) {
          await delay(1000);
        }
      } catch (error) {
        results.push({
          index: i,
          success: false,
          error: this.handleAIError(error),
        });
      }
    }

    return results;
  }

  static async evaluateResponseQuality(
    response: ITreatmentAIResponse
  ): Promise<{
    score: number;
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (response.diagnosis.length < 20) {
      issues.push("Tanı çok kısa");
      suggestions.push("Daha detaylı tanı açıklaması ekleyin");
      score -= 20;
    }

    if (response.treatment.length < 20) {
      issues.push("Tedavi önerisi çok kısa");
      suggestions.push("Tedavi seçeneklerini genişletin");
      score -= 20;
    }

    if (!response.followUp.includes("doktor")) {
      issues.push("Doktor kontrolü önerisi eksik");
      suggestions.push("Takip için doktor kontrolü önerin");
      score -= 15;
    }

    const hasWarnings = response.warnings && response.warnings.length > 0;
    if (!hasWarnings && this.containsRiskyKeywords(response.diagnosis)) {
      issues.push("Risk belirtileri var ama uyarı yok");
      suggestions.push("Güvenlik uyarısı ekleyin");
      score -= 25;
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }

  private static containsRiskyKeywords(text: string): boolean {
    const riskyKeywords = [
      "şiddetli",
      "kronik",
      "ciddi",
      "tehlikeli",
      "acil",
      "hemen",
      "derhal",
    ];

    const lowerText = text.toLowerCase();
    return riskyKeywords.some((keyword) => lowerText.includes(keyword));
  }

  private static handleAIError(error: any): string {
    if (error instanceof Error) {
      if (
        error.message.includes("rate limit") ||
        error.message.includes("429")
      ) {
        return "AI servisi rate limit aşıldı, lütfen daha sonra tekrar deneyin";
      }

      if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        return "AI servisine bağlanılamıyor, internet bağlantınızı kontrol edin";
      }

      if (error.message.includes("timeout")) {
        return "AI servisi çok yavaş yanıt veriyor, lütfen tekrar deneyin";
      }

      return `AI servisi hatası: ${error.message}`;
    }

    return "Bilinmeyen AI servisi hatası";
  }

  static getUsageStats(): {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    lastError?: string;
  } {
    return {
      totalRequests: 0,
      successRate: 0,
      averageResponseTime: 0,
    };
  }
}
