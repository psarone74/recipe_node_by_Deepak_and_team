import { api } from './api';
import { IRecipe, IIngredient } from './recipeService';

export interface IMatchItem {
  recipe: IRecipe;
  recipeId: string;
  title: string;
  image: string;
  cuisine: string;
  category: string;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  matchPercentage: number;
  matchedIngredients: string[];
  missingIngredients: IIngredient[];
  totalIngredients: number;
  matchedCount: number;
  missingCount: number;
}

export const matchingService = {
  async getMatches(params?: {
    minMatch?: number;
    sortBy?: 'highestMatch' | 'lowestMissing' | 'quickest' | 'alphabetical';
    cuisine?: string;
    dietaryType?: string;
  }) {
    const res = await api.get('/matching', { params });
    return res.data.data;
  },
};
