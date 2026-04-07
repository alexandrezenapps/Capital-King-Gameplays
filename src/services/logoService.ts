import { GoogleGenAI } from "@google/genai";

export async function generateLogo() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: 'A professional, vibrant game logo for "Capital King". It should feature a golden crown on top of a stylized skyscraper or city skyline. The style should be casual, modern, and high-quality, suitable for a mobile game icon. The colors should be gold, royal blue, and emerald green. White background.',
        },
      ],
    },
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
