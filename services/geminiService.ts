import { GoogleGenAI, Type } from "@google/genai";
import { GeminiSearchResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const searchSeriesWithGemini = async (query: string): Promise<GeminiSearchResult[]> => {
  if (!apiKey) {
    console.error("API Key missing");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Atue como uma base de dados de TV especializada. Busque por séries de TV que correspondam a: "${query}".
      Se a busca for genérica (ex: "comédia"), sugira 5 séries populares.
      Se for específica, retorne as correspondências exatas.
      Importante: Forneça uma estimativa precisa do total de episódios lançados até hoje e a duração média (em minutos).
      Forneça sinopses em Português do Brasil.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              year: { type: Type.STRING },
              synopsis: { type: Type.STRING },
              genres: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              totalSeasons: { type: Type.NUMBER },
              totalEpisodes: { type: Type.NUMBER, description: "Total number of episodes across all seasons" },
              avgEpisodeDuration: { type: Type.NUMBER, description: "Average duration in minutes" }
            },
            required: ["title", "year", "synopsis", "genres", "totalSeasons", "totalEpisodes", "avgEpisodeDuration"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiSearchResult[];
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar séries com Gemini:", error);
    return [];
  }
};

export const getRecommendations = async (userListTitles: string[]): Promise<GeminiSearchResult[]> => {
  if (!apiKey || userListTitles.length === 0) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `O usuário gosta das seguintes séries: ${userListTitles.join(', ')}.
      Recomende 4 novas séries que ele possa gostar baseadas nesse gosto.
      Não recomende séries que já estão na lista.
      Inclua total de episódios e duração média.
      Responda em Português do Brasil.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              year: { type: Type.STRING },
              synopsis: { type: Type.STRING },
              genres: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              totalSeasons: { type: Type.NUMBER },
              totalEpisodes: { type: Type.NUMBER },
              avgEpisodeDuration: { type: Type.NUMBER }
            },
            required: ["title", "year", "synopsis", "genres", "totalSeasons", "totalEpisodes", "avgEpisodeDuration"]
          }
        }
      }
    });

     if (response.text) {
      return JSON.parse(response.text) as GeminiSearchResult[];
    }
    return [];
  } catch (error) {
    console.error("Erro nas recomendações:", error);
    return [];
  }
}