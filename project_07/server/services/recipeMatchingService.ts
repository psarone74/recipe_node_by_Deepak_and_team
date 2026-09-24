import { IRecipe } from '../models/Recipe.js';
import { IPantryItem } from '../models/PantryItem.js';

export interface IMatchResult {
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
  missingIngredients: Array<{
    name: string;
    quantity: number | string;
    unit: string;
    aisle?: string;
  }>;
  totalIngredients: number;
  matchedCount: number;
  missingCount: number;
}

/**
 * Normalizes an ingredient name for flexible semantic matching.
 * Cleans punctuation, handles plurals, trims whitespace, and extracts core stems.
 */
export function normalizeIngredient(raw: string): string {
  if (!raw) return '';
  let str = raw.toLowerCase().trim();

  // Strip common preparation descriptors
  const descriptors = [
    'fresh', 'organic', 'chopped', 'diced', 'minced', 'sliced', 'grated', 
    'crushed', 'ground', 'dried', 'frozen', 'cooked', 'raw', 'extra virgin',
    'clove of', 'cloves of', 'pinch of', 'tablespoon of', 'teaspoon of', 'cup of'
  ];
  for (const desc of descriptors) {
    str = str.replace(new RegExp(`\\b${desc}\\b`, 'gi'), '');
  }

  // Remove non-alphanumeric except spaces
  str = str.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // Plural to singular normalization
  if (str.endsWith('ies') && str.length > 4) {
    str = str.slice(0, -3) + 'y'; // e.g. berries -> berry
  } else if (str.endsWith('es') && str.length > 4 && !str.endsWith('cheese')) {
    str = str.slice(0, -2); // e.g. tomatoes -> tomato, potatoes -> potato
  } else if (str.endsWith('s') && !str.endsWith('ss') && !str.endsWith('us') && !str.endsWith('cheese')) {
    str = str.slice(0, -1); // e.g. onions -> onion, eggs -> egg
  }

  return str.trim();
}

/**
 * Checks if a recipe ingredient is satisfied by any item in user's pantry.
 */
export function isIngredientMatched(recipeIngName: string, pantryList: string[]): boolean {
  const normRecipe = normalizeIngredient(recipeIngName);
  if (!normRecipe) return false;

  for (const pantryItem of pantryList) {
    const normPantry = normalizeIngredient(pantryItem);
    if (!normPantry) continue;

    // Direct match
    if (normRecipe === normPantry) return true;

    // Substring containment (e.g., 'olive oil' matches 'oil', 'russet potato' matches 'potato')
    if (normRecipe.includes(normPantry) || normPantry.includes(normRecipe)) {
      return true;
    }

    // Word token intersection
    const recipeTokens = normRecipe.split(/\s+/).filter(w => w.length > 2);
    const pantryTokens = normPantry.split(/\s+/).filter(w => w.length > 2);
    const hasOverlap = recipeTokens.some(rt => pantryTokens.some(pt => pt === rt || pt.startsWith(rt) || rt.startsWith(pt)));
    if (hasOverlap) return true;
  }

  return false;
}

/**
 * Computes smart matches across all provided recipes against user's pantry.
 */
export function computeRecipeMatches(
  recipes: IRecipe[],
  pantryItems: IPantryItem[],
  options?: {
    minMatch?: number;
    sortBy?: 'highestMatch' | 'lowestMissing' | 'quickest' | 'alphabetical';
    cuisine?: string;
    dietaryType?: string;
  }
): IMatchResult[] {
  const pantryNames = pantryItems.map(item => item.ingredient);
  const minMatch = options?.minMatch ?? 0;

  const results: IMatchResult[] = [];

  for (const recipe of recipes) {
    if (!recipe.ingredients || recipe.ingredients.length === 0) continue;

    // Filter by cuisine if specified
    if (options?.cuisine && options.cuisine !== 'All' && recipe.cuisine.toLowerCase() !== options.cuisine.toLowerCase()) {
      continue;
    }

    // Filter by dietaryType if specified
    if (options?.dietaryType && options.dietaryType !== 'All' && recipe.dietaryType !== options.dietaryType) {
      continue;
    }

    const matchedIngredients: string[] = [];
    const missingIngredients: Array<{
      name: string;
      quantity: number | string;
      unit: string;
      aisle?: string;
    }> = [];

    for (const ing of recipe.ingredients) {
      if (isIngredientMatched(ing.name, pantryNames)) {
        matchedIngredients.push(ing.name);
      } else {
        missingIngredients.push({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          aisle: ing.aisle || 'Pantry',
        });
      }
    }

    const total = recipe.ingredients.length;
    const matchedCount = matchedIngredients.length;
    const matchPercentage = Math.round((matchedCount / total) * 100);

    if (matchPercentage >= minMatch) {
      results.push({
        recipe,
        recipeId: recipe._id ? recipe._id.toString() : '',
        title: recipe.title,
        image: recipe.image,
        cuisine: recipe.cuisine,
        category: recipe.category,
        difficulty: recipe.difficulty,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        matchPercentage,
        matchedIngredients,
        missingIngredients,
        totalIngredients: total,
        matchedCount,
        missingCount: missingIngredients.length,
      });
    }
  }

  // Sort matches
  const sortBy = options?.sortBy || 'highestMatch';
  results.sort((a, b) => {
    if (sortBy === 'lowestMissing') {
      if (a.missingCount !== b.missingCount) {
        return a.missingCount - b.missingCount;
      }
      return b.matchPercentage - a.matchPercentage;
    } else if (sortBy === 'quickest') {
      return (a.cookTime + a.prepTime) - (b.cookTime + b.prepTime);
    } else if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    // Default highestMatch
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    return a.missingCount - b.missingCount;
  });

  return results;
}
