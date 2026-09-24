import axios from 'axios';
import { IRecipe, IIngredient } from '../models/Recipe.js';

const MEALDB_BASE_URL = process.env.MEALDB_API_URL || 'https://www.themealdb.com/api/json/v1/1';

export class ExternalRecipeService {
  /**
   * Search recipes from TheMealDB by query term.
   */
  static async searchRecipes(query: string = 'chicken'): Promise<IRecipe[]> {
    try {
      const response = await axios.get(`${MEALDB_BASE_URL}/search.php?s=${encodeURIComponent(query)}`, {
        timeout: 5000,
      });

      if (!response.data || !response.data.meals) {
        return [];
      }

      return response.data.meals.map((meal: any) => this.normalizeMeal(meal));
    } catch (error: any) {
      console.warn('TheMealDB search error or timeout:', error.message);
      return [];
    }
  }

  /**
   * Lookup recipe by TheMealDB ID.
   */
  static async getRecipeById(id: string): Promise<IRecipe | null> {
    try {
      const response = await axios.get(`${MEALDB_BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`, {
        timeout: 5000,
      });

      if (!response.data || !response.data.meals || response.data.meals.length === 0) {
        return null;
      }

      return this.normalizeMeal(response.data.meals[0]);
    } catch (error: any) {
      console.warn('TheMealDB lookup error:', error.message);
      return null;
    }
  }

  /**
   * Fetch random inspirational meal.
   */
  static async getRandomRecipe(): Promise<IRecipe | null> {
    try {
      const response = await axios.get(`${MEALDB_BASE_URL}/random.php`, {
        timeout: 5000,
      });

      if (!response.data || !response.data.meals || response.data.meals.length === 0) {
        return null;
      }

      return this.normalizeMeal(response.data.meals[0]);
    } catch (error: any) {
      console.warn('TheMealDB random meal error:', error.message);
      return null;
    }
  }

  /**
   * Normalize TheMealDB structure (strIngredient1..20 and strMeasure1..20) into RecipeMaster format.
   */
  private static normalizeMeal(meal: any): IRecipe {
    const ingredients: IIngredient[] = [];

    for (let i = 1; i <= 20; i++) {
      const ingName = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ingName && ingName.trim() !== '') {
        const parsedMeasure = (measure || '').trim();
        let qty: number | string = 1;
        let unit = 'piece';

        // Basic measure parsing
        const match = parsedMeasure.match(/^([\d\s\/\.\-]+)\s*(.*)$/);
        if (match) {
          qty = match[1].trim() || 1;
          unit = match[2].trim() || 'unit';
        } else if (parsedMeasure) {
          unit = parsedMeasure;
        }

        ingredients.push({
          name: ingName.trim(),
          quantity: qty,
          unit: unit || 'item',
          aisle: this.categorizeIngredient(ingName),
        });
      }
    }

    // Split instructions by period or newline
    const rawInstructions = meal.strInstructions || '';
    const instructions = rawInstructions
      .split(/\r?\n+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 5 && !s.toLowerCase().startsWith('step'));

    return {
      _id: `ext_${meal.idMeal}` as any,
      title: meal.strMeal,
      description: `Authentic ${meal.strArea || 'International'} ${meal.strCategory || 'dish'} curated from TheMealDB culinary archives.`,
      image: meal.strMealThumb || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
      author: 'external_themealdb',
      authorName: 'Global Culinary DB',
      ingredients,
      instructions: instructions.length > 0 ? instructions : [rawInstructions],
      cuisine: meal.strArea || 'International',
      category: meal.strCategory || 'Dinner',
      difficulty: ingredients.length > 8 ? 'Medium' : 'Easy',
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      tags: [meal.strCategory, meal.strArea, 'International'].filter(Boolean),
      dietaryType: meal.strCategory === 'Vegetarian' ? 'Vegetarian' : (meal.strCategory === 'Vegan' ? 'Vegan' : 'Non-Vegetarian'),
      isExternal: true,
      externalSourceUrl: meal.strSource || meal.strYoutube,
    } as unknown as IRecipe;
  }

  private static categorizeIngredient(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('garlic') || lower.includes('onion') || lower.includes('tomato') || lower.includes('herb') || lower.includes('lemon') || lower.includes('potato') || lower.includes('spinach')) return 'Produce';
    if (lower.includes('milk') || lower.includes('butter') || lower.includes('cream') || lower.includes('cheese') || lower.includes('yogurt')) return 'Dairy';
    if (lower.includes('salmon') || lower.includes('tuna') || lower.includes('prawn') || lower.includes('shrimp') || lower.includes('fish')) return 'Seafood';
    if (lower.includes('chicken') || lower.includes('beef') || lower.includes('pork') || lower.includes('lamb') || lower.includes('bacon')) return 'Meat';
    if (lower.includes('oil') || lower.includes('sauce') || lower.includes('rice') || lower.includes('pasta') || lower.includes('flour') || lower.includes('sugar') || lower.includes('salt') || lower.includes('pepper')) return 'Pantry';
    return 'Pantry';
  }
}
