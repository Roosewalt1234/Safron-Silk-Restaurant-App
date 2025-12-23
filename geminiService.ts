
import { GoogleGenAI, Type } from "@google/genai";

// Always use process.env.API_KEY directly in the named parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFoodRecommendations(cartItems: string[], preference: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The customer has these items in their cart: ${cartItems.join(', ')}. They prefer: ${preference}. 
      Suggest 3 additional items from our menu (North Indian, South Indian, or Chinese fusion) that would pair well. 
      Format as a concise JSON list of objects with "name" and "reason".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: 'The name of the recommended dish.',
              },
              reason: {
                type: Type.STRING,
                description: 'Why this dish pairs well with the current cart contents.',
              }
            },
            required: ["name", "reason"],
            propertyOrdering: ["name", "reason"],
          }
        }
      }
    });

    const text = response.text;
    return JSON.parse(text || '[]');
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
}

/**
 * Generates a high-definition photorealistic image of a dish.
 */
export async function generateGourmetImage(dishName: string, description: string) {
  try {
    const prompt = `Professional high-end food photography of the dish: "${dishName}". 
    Context: ${description}. 
    Style: Placed on a fresh vibrant green banana leaf or elegant white ceramic plate on a dark rustic wooden table. 
    Lighting: Warm, soft natural morning side-lighting. 
    Details: Extreme high detail, shallow depth of field with a blurred background, steam gently rising from the food. 
    Authenticity: Ensure the presentation is culturally authentic to North/South Indian or Chinese tradition. 
    8k resolution, cinematic, appetizing, culinary magazine style.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    // Iterate through parts to find the image data
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
}

// Audio Utilities for Live API
export function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
