import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

// Initialize gently, fallback handled in UI if key is missing
try {
  if (process.env.API_KEY) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (e) {
  console.error("Failed to init Gemini client", e);
}

export const GeminiService = {
  askAssistant: async (query: string): Promise<string> => {
    if (!client) {
      return "Извините, AI помощник временно недоступен (API Key not configured).";
    }

    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          systemInstruction: "Ты опытный помощник в магазине сантехники. Твоя цель - помогать клиентам выбирать трубы, смесители, ванны и решать проблемы с сантехникой. Отвечай кратко, вежливо и профессионально. Предлагай товары, если это уместно.",
        }
      });
      return response.text || "Извините, не удалось сформировать ответ.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Произошла ошибка при обращении к помощнику.";
    }
  }
};