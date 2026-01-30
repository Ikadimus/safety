
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Análise Individual do Colaborador
 * Foco: Permissões de trabalho e impedimentos técnicos
 */
export const analyzeEmployeeCompliance = async (employeeName: string, role: string, documents: string) => {
  try {
    // Instancia o cliente dentro da função para garantir o uso da chave atualizada
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: {
        parts: [{
          text: `PARECER TÉCNICO INDIVIDUAL
          Colaborador: ${employeeName}
          Função: ${role}
          Certificados: ${documents}
          
          REGRAS DE FORMATAÇÃO:
          1. Utilize o formato **TÓPICO:** (com asteriscos) para cada título de seção.
          2. Liste ATIVIDADES AUTORIZADAS com base nas NRs válidas.
          3. Destaque IMPEDIMENTOS se faltar NR essencial para a função.
          4. Seja direto. Sem introduções. Destaque títulos importantes em negrito.`
        }]
      },
      config: {
        systemInstruction: "Você é um auditor de segurança do trabalho experiente da BioSafety. Sua saída deve usar obrigatoriamente **MARCADORES EM NEGRITO** para títulos de tópicos.",
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Erro na análise Gemini (Individual):", error);
    return "Falha na análise individual. Verifique a conexão com a rede ou as credenciais de API.";
  }
};

/**
 * Análise de Capacidade da Prestadora
 * Foco: Portfólio de NRs e cursos disponíveis na equipe
 */
export const analyzeProviderCapability = async (providerName: string, allEmployeesData: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: {
        parts: [{
          text: `MAPA DE COMPETÊNCIAS - PRESTADORA: ${providerName}
          Dados Consolidados: ${allEmployeesData}
          
          OBJETIVO: Identificar todas as NRs, cursos e habilidades técnicas que esta empresa possui.
          
          REGRAS DE FORMATAÇÃO:
          1. Utilize o formato **TÓPICO:** (com asteriscos) para cada título de seção.
          2. Liste todas as NRs/Certificações mapeadas na equipe.
          3. Resuma o potencial operacional.
          4. Sem introduções. Direto ao portfólio. Use negrito para títulos.`
        }]
      },
      config: {
        systemInstruction: "Você é um analista de suprimentos e segurança industrial. Liste as capacidades técnicas usando **TÓPICOS EM NEGRITO** para destaque.",
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Erro na análise Gemini (Prestadora):", error);
    return "Falha no mapeamento da prestadora. Verifique se o serviço de IA está disponível para sua região.";
  }
};

/**
 * Sugestão de Plano de Treinamento
 */
export const suggestTrainingPlan = async (jobDescription: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: {
        parts: [{
          text: `Com base na função: ${jobDescription}, liste as NRs obrigatórias para atuação em usina de biometano.`
        }]
      },
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
    console.error("Erro na sugestão de treinamento Gemini:", error);
    return null;
  }
};
