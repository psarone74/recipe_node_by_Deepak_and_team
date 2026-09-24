import { api } from './api';
import { IIngredient } from './recipeService';

export interface IShoppingItem {
  _id?: string;
  userId: string;
  ingredient: string;
  quantity: number | string;
  unit: string;
  category?: string;
  checked: boolean;
  recipeOrigin?: string;
  estimatedPrice?: number;
  createdAt?: string;
}

export const shoppingListService = {
  async getShoppingList() {
    const res = await api.get('/shopping-list');
    return res.data;
  },

  async addItem(item: { ingredient: string; quantity?: number | string; unit?: string; category?: string; estimatedPrice?: number; recipeOrigin?: string }) {
    const res = await api.post('/shopping-list', item);
    return res.data;
  },

  async toggleItem(id: string) {
    const res = await api.put(`/shopping-list/${id}/toggle`);
    return res.data;
  },

  async deleteItem(id: string) {
    const res = await api.delete(`/shopping-list/${id}`);
    return res.data;
  },

  async clearCompleted() {
    const res = await api.delete('/shopping-list/completed');
    return res.data;
  },

  async addMissingIngredients(ingredients: IIngredient[], recipeTitle: string) {
    const res = await api.post('/shopping-list/add-missing', { ingredients, recipeTitle });
    return res.data;
  },

  async autoStockToPantry(itemIds?: string[], onlyChecked: boolean = false) {
    const res = await api.post('/shopping-list/auto-stock', { itemIds, onlyChecked });
    return res.data;
  },
};
