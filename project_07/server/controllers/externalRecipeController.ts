import { Request, Response } from 'express';
import { ExternalRecipeService } from '../services/externalRecipeService.js';
import { RecipeModel } from '../models/Recipe.js';
import { AuthRequest } from '../middleware/auth.js';

export async function searchExternalRecipes(req: Request, res: Response) {
  try {
    const { q = 'pasta' } = req.query;
    const meals = await ExternalRecipeService.searchRecipes(q as string);
    return res.status(200).json({
      success: true,
      data: meals,
      count: meals.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getExternalRecipeById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const meal = await ExternalRecipeService.getRecipeById(id);
    if (!meal) {
      return res.status(404).json({ success: false, message: 'External recipe not found.' });
    }
    return res.status(200).json({
      success: true,
      data: meal,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getRandomExternalRecipe(req: Request, res: Response) {
  try {
    const meal = await ExternalRecipeService.getRandomRecipe();
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Could not fetch inspiration recipe.' });
    }
    return res.status(200).json({
      success: true,
      data: meal,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function importExternalRecipe(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { recipeId } = req.body;
    let meal = null;

    if (recipeId.startsWith('ext_')) {
      const cleanId = recipeId.replace('ext_', '');
      meal = await ExternalRecipeService.getRecipeById(cleanId);
    } else {
      meal = await ExternalRecipeService.getRecipeById(recipeId);
    }

    if (!meal) {
      return res.status(404).json({ success: false, message: 'External recipe could not be found to import.' });
    }

    // Clone into user recipes
    const imported = await RecipeModel.create({
      ...meal,
      _id: undefined, // Create fresh ID
      author: req.user._id.toString(),
      authorName: req.user.name,
      title: `${meal.title} (Imported)`,
      isExternal: false,
    });

    return res.status(201).json({
      success: true,
      message: `"${meal.title}" imported to your Recipe Studio!`,
      data: imported,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
