import { Response } from 'express';
import { FavoriteModel } from '../models/Favorite.js';
import { RecipeModel } from '../models/Recipe.js';
import { AuthRequest } from '../middleware/auth.js';

export async function toggleFavorite(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { recipeId } = req.body;
    if (!recipeId) {
      return res.status(400).json({ success: false, message: 'Recipe ID is required.' });
    }

    const existing = await FavoriteModel.findOne({
      userId: req.user._id,
      recipeId,
    });

    if (existing) {
      await FavoriteModel.findByIdAndDelete(existing._id!);
      return res.status(200).json({
        success: true,
        isFavorited: false,
        message: 'Removed from favorites.',
      });
    } else {
      await FavoriteModel.create({
        userId: req.user._id,
        recipeId,
      });
      return res.status(200).json({
        success: true,
        isFavorited: true,
        message: 'Saved to favorites!',
      });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getFavorites(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const favs = await FavoriteModel.find({ userId: req.user._id });
    const recipeIds = favs.map(f => f.recipeId);

    const recipes = await RecipeModel.find({ _id: { $in: recipeIds } });

    return res.status(200).json({
      success: true,
      data: recipes,
      totalCount: recipes.length,
      favoriteIds: recipeIds,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
