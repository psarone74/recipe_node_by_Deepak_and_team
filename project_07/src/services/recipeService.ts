import { api } from './api';

export interface IIngredient {
  name: string;
  quantity: number | string;
  unit: string;
  aisle?: string;
}

export interface IRecipe {
  _id?: string;
  title: string;
  description: string;
  image: string;
  author: string;
  authorName?: string;
  ingredients: IIngredient[];
  instructions: string[];
  cuisine: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: string[];
  dietaryType: string;
  calories?: number;
  isExternal?: boolean;
  externalSourceUrl?: string;
  createdAt?: string;
  pantryMatch?: {
    percentage: number;
    matched: string[];
    missing: IIngredient[];
    totalIngredients: number;
  };
}

export const recipeService = {
  async getRecipes(params?: {
    search?: string;
    cuisine?: string;
    category?: string;
    dietaryType?: string;
    difficulty?: string;
    maxCookTime?: number;
    tag?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }) {
    const res = await api.get('/recipes', { params });
    return res.data;
  },

  async getAllTags(): Promise<string[]> {
    try {
      const res = await api.get('/recipes/tags');
      return res.data.data || [];
    } catch (e) {
      console.warn('Failed to fetch tags', e);
      return [];
    }
  },

  async getRecipeById(id: string) {
    const res = await api.get(`/recipes/${id}`);
    return res.data.data;
  },

  async getMyRecipes() {
    const res = await api.get('/recipes/my-recipes');
    return res.data.data;
  },

  async createRecipe(recipe: Partial<IRecipe>) {
    const res = await api.post('/recipes', recipe);
    return res.data;
  },

  async updateRecipe(id: string, recipe: Partial<IRecipe>) {
    const res = await api.put(`/recipes/${id}`, recipe);
    return res.data;
  },

  async deleteRecipe(id: string) {
    const res = await api.delete(`/recipes/${id}`);
    return res.data;
  },
};
