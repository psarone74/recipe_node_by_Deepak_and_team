import { api } from './api';

export interface IPantryItem {
  _id?: string;
  userId: string;
  ingredient: string;
  quantity: number | string;
  unit: string;
  category?: string;
  expiryDate?: string;
  createdAt?: string;
}

export const pantryService = {
  async getPantry(params?: { search?: string; category?: string }) {
    const res = await api.get('/pantry', { params });
    return res.data;
  },

  async addItem(item: Partial<IPantryItem>) {
    const res = await api.post('/pantry', item);
    return res.data;
  },

  async updateItem(id: string, item: Partial<IPantryItem>) {
    const res = await api.put(`/pantry/${id}`, item);
    return res.data;
  },

  async deleteItem(id: string) {
    const res = await api.delete(`/pantry/${id}`);
    return res.data;
  },

  async quickAdd(items: Array<{ name: string; quantity?: number; unit?: string; category?: string }>) {
    const res = await api.post('/pantry/quick-add', { items });
    return res.data;
  },
};
