export const AI_CONSTANTS = {
    PROMPTS: {
        TREATMENT_SYSTEM_ROLE: `Sen deneyimli bir doktorsun. Hastanın şikayetlerine göre profesyonel bir tedavi raporu hazırlayacaksın.`,

        TREATMENT_FORMAT: `Lütfen yanıtını şu JSON formatında ver:
{
  "diagnosis": "Muhtemel tanı açıklaması",
  "treatment": "Önerilen tedavi yöntemi",
  "recommendations": "Hastaya öneriler ve yaşam tarzı tavsiyeleri",
  "followUp": "Takip süreci ve kontrol önerileri"
}`,
    },

    LIMITS: {
        MAX_COMPLAINT_LENGTH: 2000,
        MAX_PROMPT_LENGTH: 4000,
        MIN_COMPLAINT_LENGTH: 10,
    },

    REQUIRED_FIELDS: ['diagnosis', 'treatment', 'recommendations', 'followUp'] as const,

    ERRORS: {
        INVALID_RESPONSE: 'AI servisi geçersiz yanıt döndü',
        API_UNAVAILABLE: 'AI servisi şu anda kullanılamıyor',
        RATE_LIMIT: 'AI servisi rate limit aşıldı, lütfen daha sonra tekrar deneyin',
        INVALID_INPUT: 'Hasta şikayeti geçersiz format',
    }
} as const;

export enum AIServiceStatus {
    AVAILABLE = 'available',
    UNAVAILABLE = 'unavailable',
    RATE_LIMITED = 'rate_limited',
    ERROR = 'error'
}

export enum AIResponseQuality {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
    INVALID = 'invalid'
}