export class TreatmentPromptTemplate {
    
    static readonly SYSTEM_ROLE = `
Sen deneyimli bir aile hekimisin. Hastalardan gelen şikayetlere göre ön değerlendirme yapıyorsun.
Verdiğin öneriler genel bilgilendirme amaçlıdır ve kesin tanı yerine geçmez.
Her zaman hastayı doktora yönlendirmeyi unutma.
`;

    static readonly RESPONSE_FORMAT = `
YANIT FORMATINI KESİNLİKLE ŞÖYLE VER:

{
  "diagnosis": "Muhtemel tanı ve açıklama",
  "treatment": "Önerilen tedavi yöntemleri", 
  "recommendations": "Genel öneriler ve yaşam tarzı tavsiyeleri",
  "followUp": "Takip süreci ve ne zaman doktora başvurmalı"
}

SADECE JSON FORMATINDA YANIT VER, BAŞKA BİR ŞEY YAZMA.
`;

 
    static readonly SAFETY_GUIDELINES = `
ÖNEMLİ UYARILAR:
- Kesin tanı koymaya çalışma
- İlaç dozajı belirtme
- Acil durumları tespit et ve hemen doktora yönlendir
- Şüpheli durumlarda "derhal doktora başvurun" de
`;

  
    static readonly EMERGENCY_INDICATORS = [
        'göğüs ağrısı',
        'nefes darlığı',
        'bilinç kaybı',
        'yüksek ateş',
        'şiddetli karın ağrısı',
        'kalp çarpıntısı',
        'felç belirtileri',
        'şiddetli baş ağrısı'
    ];

    static buildPatientContext(data: {
        age?: number;
        gender?: string;
        medicalHistory?: string;
        allergies?: string[];
        currentMedications?: string[];
    }): string {
        let context = "HASTA BİLGİLERİ:\n";

        if (data.age) {
            context += `- Yaş: ${data.age}\n`;
        }

        if (data.gender) {
            context += `- Cinsiyet: ${data.gender}\n`;
        }

        if (data.medicalHistory) {
            context += `- Tıbbi Geçmiş: ${data.medicalHistory}\n`;
        }

        if (data.allergies && data.allergies.length > 0) {
            context += `- Alerjiler: ${data.allergies.join(', ')}\n`;
        }

        if (data.currentMedications && data.currentMedications.length > 0) {
            context += `- Mevcut İlaçlar: ${data.currentMedications.join(', ')}\n`;
        }

        return context;
    }

    static buildComplaintSection(data: {
        primary: string;
        symptoms?: string[];
        duration?: string;
        severity?: 'mild' | 'moderate' | 'severe';
    }): string {
        let complaint = "HASTA ŞİKAYETİ:\n";
        complaint += `- Ana Şikayet: ${data.primary}\n`;

        if (data.symptoms && data.symptoms.length > 0) {
            complaint += `- Eşlik Eden Semptomlar: ${data.symptoms.join(', ')}\n`;
        }

        if (data.duration) {
            complaint += `- Süre: ${data.duration}\n`;
        }

        if (data.severity) {
            const severityMap = {
                mild: 'Hafif',
                moderate: 'Orta',
                severe: 'Şiddetli'
            };
            complaint += `- Şiddet: ${severityMap[data.severity]}\n`;
        }

        return complaint;
    }

  
    static checkEmergencyKeywords(complaint: string): boolean {
        const lowerComplaint = complaint.toLowerCase();
        return this.EMERGENCY_INDICATORS.some(indicator =>
            lowerComplaint.includes(indicator)
        );
    }

  
    static buildEmergencyPrompt(): string {
        return `
BU DURUM ACİL!

{
  "diagnosis": "ACİL DURUM TESPİT EDİLDİ - Derhal değerlendirme gerekli",
  "treatment": "HEMEN EN YAKIN SAĞLIK KURULUŞUNA BAŞVURUN veya 112'yi arayın",
  "recommendations": "Zaman kaybetmeden acil servise gidin",
  "followUp": "Bu durum acil müdahale gerektirmektedir"
}
`;
    }
}