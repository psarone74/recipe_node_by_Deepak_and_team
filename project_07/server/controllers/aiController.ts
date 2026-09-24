import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export async function culinaryAdvisor(req: Request, res: Response) {
  try {
    const { prompt, recipeTitle, currentIngredients, requestedSubstitute } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: true,
        data: {
          answer: `For ${requestedSubstitute || 'missing ingredients'}, you can substitute with common pantry items like nutritional yeast for cheese, flaxseed egg for eggs, or lemon juice for vinegar.`,
          groundingSources: [],
        },
      });
    }

    const ai = new GoogleGenAI();

    const query = prompt || `In the recipe "${recipeTitle || 'Dish'}", what are the best culinary substitutes for "${requestedSubstitute}" considering flavour profile and cooking chemistry? Provide 3 specific alternatives with exact ratios and brief chef tips.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const text = response.text || 'No advice generated.';
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchWebSources = searchChunks
      .map((c: any) => c.web?.uri ? { title: c.web.title, uri: c.web.uri } : null)
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      data: {
        answer: text,
        groundingSources: searchWebSources,
      },
    });
  } catch (error: any) {
    console.error('Gemini search grounding error:', error);
    return res.status(200).json({
      success: true,
      data: {
        answer: 'Chef tip: You can substitute dairy butter with olive oil or ghee in equal measures. For missing aromatics, onion powder or chives make excellent substitutes.',
        groundingSources: [],
      },
    });
  }
}
