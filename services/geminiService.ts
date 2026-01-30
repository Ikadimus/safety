
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeCompliance = async (providerName: string, employeesData: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise a conformidade de segurança para o fornecedor "${providerName}" na usina de purificação de biogás de aterro sanitário "Biometano Caieiras". 
      Dados dos funcionários: ${employeesData}. 
      Gere um resumo curto destacando riscos imediatos (foco em H2S, Metano e Espaço Confinado), treinamentos vencidos críticos e uma recomendação para o Técnico de Segurança.`,
      config: {
        systemInstruction: "Você é um Engenheiro de Segurança do Trabalho especialista em Usinas de Biometano e Aterros Sanitários. Forneça insights técnicos, diretos e priorize riscos fatais.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Não foi possível realizar a análise inteligente no momento.";
  }
};

export const suggestTrainingPlan = async (jobDescription: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `O funcionário terá a seguinte função na purificação de biogás: ${jobDescription}. Liste as NRs e cursos obrigatórios necessários para trabalhar com biometano (Ex: NR-20, NR-33, NR-35).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            requiredNRs: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: { type: Type.STRING }
          },
          required: ["requiredNRs", "recommendations"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Plan Error:", error);
    return null;
  }
};
