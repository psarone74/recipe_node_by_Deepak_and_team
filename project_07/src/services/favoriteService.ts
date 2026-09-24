import { api } from './api';
import { IRecipe } from './recipeService';

export const favoriteService = {
  async getFavorites(): Promise<{ data: IRecipe[]; favoriteIds: string[] }> {
    const res = await api.get('/favorites');
    return res.data;
  },

  async toggleFavorite(recipeId: string): Promise<{ isFavorited: boolean; message: string }> {
    const res = await api.post('/favorites/toggle', { recipeId });
    return res.data;
  },
};
