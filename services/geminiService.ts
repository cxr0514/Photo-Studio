import { GoogleGenAI, Modality, GenerateContentResponse, Part, Type } from "@google/genai";
import { ImageFile, LightingStyle, CameraPerspective } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getSceneIdea = async (idea: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a creative director for product photoshoots. A user will provide a short scene idea. Expand it into a detailed, descriptive prompt for an AI image generator. Focus on creating a vivid and appealing setting. Do not mention the product itself, only the scene.
      
      User Idea: "${idea}"
      
      Detailed Scene Description:`,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting scene idea from text:", error);
    throw new Error("Failed to generate scene idea from description.");
  }
};

export const getSceneIdeaFromImage = async (styleImage: ImageFile): Promise<string> => {
    try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: styleImage.base64,
              mimeType: styleImage.mimeType,
            },
          },
          {
            text: "You are a creative director for product photoshoots. Analyze the provided image. Based on its style, mood, and environment, generate a single, detailed scene description that can be used as a prompt for an AI image generator to place a new product into a similar setting. Describe the background, lighting, color palette, and overall atmosphere. Do not describe any specific object that might be in the foreground of the reference image.",
          },
        ],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error getting scene idea from image:", error);
    throw new Error("Failed to generate scene idea from image.");
  }
};

export const getStyleSuggestions = async (
  productImage: ImageFile,
  description: string
): Promise<{ lightingStyle: LightingStyle; cameraPerspective: CameraPerspective; sceneDescription: string }> => {
  try {
    const textPrompt = `You are an expert product photographer and creative director. Analyze the provided product image. Based on the product and the user's optional notes, suggest the best lighting style, camera perspective, and a creative scene description to generate a stunning product shot.

    User notes: "${description || 'None'}"

    Your response must be a valid JSON object matching the provided schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: productImage.base64,
              mimeType: productImage.mimeType,
            },
          },
          { text: textPrompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lightingStyle: {
              type: Type.STRING,
              enum: Object.values(LightingStyle),
              description: 'The recommended lighting style for the product.',
            },
            cameraPerspective: {
              type: Type.STRING,
              enum: Object.values(CameraPerspective),
              description: 'The recommended camera perspective.',
            },
            sceneDescription: {
              type: Type.STRING,
              description: 'A creative and detailed scene description for the product photoshoot.',
            },
          },
          required: ['lightingStyle', 'cameraPerspective', 'sceneDescription'],
        },
      },
    });

    const jsonStr = response.text.trim();
    const suggestions = JSON.parse(jsonStr);
    
    if (
        !suggestions.lightingStyle || 
        !suggestions.cameraPerspective || 
        typeof suggestions.sceneDescription === 'undefined'
    ) {
        throw new Error('Invalid response format from AI.');
    }

    return suggestions;
  } catch (error) {
    console.error("Error getting style suggestions:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse AI response. The model may have returned invalid JSON.");
    }
    throw new Error("Failed to generate style suggestions.");
  }
};

export const generateEditedImage = async (
  productImage: ImageFile,
  prompt: string
): Promise<{ imageUrl: string | null; text: string | null }> => {
  try {
    const parts: Part[] = [
      {
        inlineData: {
          data: productImage.base64,
          mimeType: productImage.mimeType,
        },
      },
      { text: prompt }
    ];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    let imageUrl: string | null = null;
    let text: string | null = null;

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        text = part.text;
      } else if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }

    return { imageUrl, text };
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. Please check your API key and try again.");
  }
};