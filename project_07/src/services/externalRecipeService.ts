import { api } from './api';
import { IRecipe } from './recipeService';

export const externalRecipeService = {
  async search(query: string = 'pasta'): Promise<IRecipe[]> {
    const res = await api.get('/external-recipes/search', { params: { q: query } });
    return res.data.data;
  },

  async getRandom(): Promise<IRecipe> {
    const res = await api.get('/external-recipes/random');
    return res.data.data;
  },

  async getById(id: string): Promise<IRecipe> {
    const res = await api.get(`/external-recipes/${id}`);
    return res.data.data;
  },

  async importToMyStudio(recipeId: string): Promise<IRecipe> {
    const res = await api.post('/external-recipes/import', { recipeId });
    return res.data.data;
  },
};
