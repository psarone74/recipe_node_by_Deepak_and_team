import { api } from './api';

export interface IMealPlan {
  _id?: string;
  userId: string;
  recipeId: string;
  recipeTitle?: string;
  recipeImage?: string;
  cookTime?: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
  calories?: number;
  completed?: boolean;
}

export const mealPlanService = {
  async getWeeklyPlan(startDate?: string, endDate?: string) {
    const res = await api.get('/meal-plans/weekly', { params: { startDate, endDate } });
    return res.data;
  },

  async getTodayMeals() {
    const res = await api.get('/meal-plans/today');
    return res.data;
  },

  async addMeal(meal: { recipeId: string; date: string; mealType: string; notes?: string }) {
    const res = await api.post('/meal-plans', meal);
    return res.data;
  },

  async updateMeal(id: string, updates: Partial<IMealPlan>) {
    const res = await api.put(`/meal-plans/${id}`, updates);
    return res.data;
  },

  async deleteMeal(id: string) {
    const res = await api.delete(`/meal-plans/${id}`);
    return res.data;
  },
};
