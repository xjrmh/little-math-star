import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey });

export const generateMathStory = async (number: number): Promise<string> => {
  if (!apiKey) {
    return `Once upon a time, there was a number ${number} who loved to play hide and seek!`;
  }

  try {
    const prompt = `You are a cheerful preschool teacher. Write a very short, magical, rhyming story (maximum 25 words) about the number ${number}. Make it fun and simple for a 4-year-old. Do not include any titles or markdown formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating story:", error);
    return `The magical number ${number} danced in the sky with the stars!`;
  }
};
