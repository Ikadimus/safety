
import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY não configurada no ambiente.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Análise Individual do Colaborador
 * Foco: Permissões de trabalho e impedimentos técnicos
 */
export const analyzeEmployeeCompliance = async (employeeName: string, role: string, documents: string) => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `PARECER TÉCNICO INDIVIDUAL
      Colaborador: ${employeeName}
      Função: ${role}
      Certificados: ${documents}
      
      REGRAS DE FORMATAÇÃO:
      1. Utilize o formato **TÓPICO:** (com asteriscos) para cada título de seção.
      2. Liste ATIVIDADES AUTORIZADAS com base nas NRs válidas.
      3. Destaque IMPEDIMENTOS se faltar NR essencial para a função.
      4. Seja direto. Sem introduções.`,
      config: {
        systemInstruction: "Você é um auditor de segurança do trabalho. Sua saída deve usar obrigatoriamente **MARCADORES EM NEGRITO** para títulos de tópicos.",
      }
    });
    return response.text;
  } catch (error) {
    return "Falha na análise individual.";
  }
};

/**
 * Análise de Capacidade da Prestadora
 * Foco: Portfólio de NRs e cursos disponíveis na equipe
 */
export const analyzeProviderCapability = async (providerName: string, allEmployeesData: string) => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `MAPA DE COMPETÊNCIAS - PRESTADORA: ${providerName}
      Dados Consolidados: ${allEmployeesData}
      
      OBJETIVO: Identificar todas as NRs, cursos e habilidades técnicas que esta empresa possui.
      
      REGRAS DE FORMATAÇÃO:
      1. Utilize o formato **TÓPICO:** (com asteriscos) para cada título de seção.
      2. Liste todas as NRs/Certificações mapeadas na equipe.
      3. Resuma o potencial operacional.
      4. Sem introduções. Direto ao portfólio.`,
      config: {
        systemInstruction: "Você é um analista de suprimentos e segurança. Liste as capacidades técnicas usando **TÓPICOS EM NEGRITO** para destaque.",
      }
    });
    return response.text;
  } catch (error) {
    return "Falha no mapeamento da prestadora.";
  }
};

export const suggestTrainingPlan = async (jobDescription: string) => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Com base na função: ${jobDescription}, liste as NRs obrigatórias para atuação em usina de biometano.`,
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
    return null;
  }
};
