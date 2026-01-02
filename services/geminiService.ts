import { GoogleGenAI } from "@google/genai";
import { MENU_DATA } from "../constants";

export const getCoffeeRecommendation = async (userQuery: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Please provide an API Key to use the Coffee Concierge.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  // Flatten menu for context
  const menuContext = MENU_DATA.map(cat => 
    `${cat.name}: ${cat.items.map(item => `${item.name} ($${item.price})`).join(', ')}`
  ).join('\n');

  const systemInstruction = `You are a helpful barista assistant at KAINOR Coffee & Food. 
  Your goal is to recommend drinks or pastries from our menu based on the user's preference.
  
  Here is our Menu:
  ${menuContext}
  
  Keep your answers short, friendly, and enthusiastic. Always mention the price of the recommended item.
  If the user asks about something not on the menu, politely suggest a similar item we do have.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I'm sorry, I couldn't think of a recommendation right now. Try checking our Best Sellers!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having a little trouble connecting to the recipe book (API Error). Please try again later.";
  }
};