import { Response } from 'express';
import { RecipeModel } from '../models/Recipe.js';
import { PantryItemModel } from '../models/PantryItem.js';
import { AuthRequest } from '../middleware/auth.js';
import { computeRecipeMatches } from '../services/recipeMatchingService.js';

export async function getPantryMatches(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { minMatch = 0, sortBy = 'highestMatch', cuisine, dietaryType } = req.query;

    const userPantry = await PantryItemModel.find({ userId: req.user._id });
    const allRecipes = await RecipeModel.find({});

    const minMatchNum = parseInt(minMatch as string, 10) || 0;

    const matches = computeRecipeMatches(allRecipes, userPantry, {
      minMatch: minMatchNum,
      sortBy: sortBy as any,
      cuisine: cuisine as string,
      dietaryType: dietaryType as string,
    });

    return res.status(200).json({
      success: true,
      data: {
        matches,
        pantryItemsCount: userPantry.length,
        pantrySummary: userPantry.map(p => p.ingredient),
        totalMatches: matches.length,
        highMatchCount: matches.filter(m => m.matchPercentage >= 75).length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
