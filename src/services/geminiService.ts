
import { GoogleGenAI, Type } from "@google/genai";

// Safety check to ensure process exists in the browser context
const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    return "";
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const getDressRecommendation = async (customerProfile: string, occasion: string) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("API Key missing");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest a luxury dress from the Lord's Bespoke categories: Royal Classic Suit, Urban Elite Set, Executive Line, Festive Premium, Trendy Party Fit, Imperial Ceremony, Signature Luxury, Lords Special Edition.
      Customer details: ${customerProfile}
      Occasion: ${occasion}
      Provide a justification and key styling tips.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedCategory: { type: Type.STRING },
            justification: { type: Type.STRING },
            stylingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["recommendedCategory", "justification", "stylingTips"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
