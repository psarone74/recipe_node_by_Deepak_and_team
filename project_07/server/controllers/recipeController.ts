import { Request, Response } from 'express';
import { RecipeModel, IRecipe, sanitizeRecipeTags } from '../models/Recipe.js';
import { PantryItemModel } from '../models/PantryItem.js';
import { AuthRequest } from '../middleware/auth.js';
import { isIngredientMatched } from '../services/recipeMatchingService.js';

export async function getRecipes(req: Request, res: Response) {
  try {
    const {
      search,
      cuisine,
      category,
      dietaryType,
      difficulty,
      maxCookTime,
      tag,
      page = 1,
      limit = 12,
      sortBy = 'newest'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10) || 12));

    const query: any = {};

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { cuisine: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { 'ingredients.name': { $regex: q, $options: 'i' } }
      ];
    }

    if (tag && typeof tag === 'string' && tag.trim() !== '' && tag !== 'All') {
      const tQuery = tag.trim();
      query.tags = { $regex: tQuery, $options: 'i' };
    }

    if (cuisine && cuisine !== 'All') {
      query.cuisine = { $regex: new RegExp(`^${cuisine}$`, 'i') };
    }

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (dietaryType && dietaryType !== 'All') {
      query.dietaryType = dietaryType;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (maxCookTime) {
      const maxMins = parseInt(maxCookTime as string, 10);
      if (!isNaN(maxMins)) {
        query.$expr = { $lte: [{ $add: ["$prepTime", "$cookTime"] }, maxMins] };
      }
    }

    let sortOption: any = { createdAt: -1 };
    if (sortBy === 'quickest') {
      sortOption = { cookTime: 1, prepTime: 1 };
    } else if (sortBy === 'alphabetical') {
      sortOption = { title: 1 };
    }

    const total = await RecipeModel.countDocuments(query);
    const pages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;

    const paginated = await RecipeModel.find(query)
      .sort(sortOption)
      .skip(startIndex)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getRecipeById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const recipe = await RecipeModel.findById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found.',
      });
    }

    let pantryMatch = null;
    if (req.user?._id) {
      const userPantry = await PantryItemModel.find({ userId: req.user._id });
      const pantryNames = userPantry.map(p => p.ingredient);

      const matched: string[] = [];
      const missing: any[] = [];

      for (const ing of recipe.ingredients || []) {
        if (isIngredientMatched(ing.name, pantryNames)) {
          matched.push(ing.name);
        } else {
          missing.push(ing);
        }
      }

      const total = recipe.ingredients?.length || 1;
      const percentage = Math.round((matched.length / total) * 100);

      pantryMatch = {
        percentage,
        matched,
        missing,
        totalIngredients: total,
      };
    }

    // Convert Mongoose doc to plain object to attach pantryMatch
    const recipeDoc = typeof recipe.toObject === 'function' ? recipe.toObject() : recipe;

    return res.status(200).json({
      success: true,
      data: {
        ...recipeDoc,
        pantryMatch,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createRecipe(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const {
      title,
      description,
      image,
      ingredients,
      instructions,
      cuisine,
      category,
      difficulty,
      prepTime,
      cookTime,
      servings,
      tags,
      dietaryType,
      calories,
    } = req.body;

    if (!title || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipe title and at least one ingredient are required.',
      });
    }

    if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipe instructions must have at least one step.',
      });
    }

    const newRecipe = await RecipeModel.create({
      title: title.trim(),
      description: description?.trim() || '',
      image: image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format&fit=crop',
      author: req.user._id.toString(),
      authorName: req.user.name,
      ingredients: ingredients.map((i: any) => ({
        name: i.name.trim(),
        quantity: i.quantity || 1,
        unit: i.unit || 'unit',
        aisle: i.aisle || 'Pantry',
      })),
      instructions: instructions.map((s: string) => s.trim()).filter(Boolean),
      cuisine: cuisine || 'International',
      category: category || 'Dinner',
      difficulty: difficulty || 'Medium',
      prepTime: Number(prepTime) || 15,
      cookTime: Number(cookTime) || 20,
      servings: Number(servings) || 4,
      tags: sanitizeRecipeTags(tags),
      dietaryType: dietaryType || 'Any',
      calories: Number(calories) || undefined,
    });

    return res.status(201).json({
      success: true,
      message: 'Recipe created successfully!',
      data: newRecipe,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateRecipe(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { id } = req.params;
    const existing = await RecipeModel.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    if (existing.author !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit recipes that you authored.',
      });
    }

    const updateData = { ...req.body };
    if (updateData.tags !== undefined) {
      updateData.tags = sanitizeRecipeTags(updateData.tags);
    }

    const updated = await RecipeModel.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(200).json({
      success: true,
      message: 'Recipe updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllTags(req: Request, res: Response) {
  try {
    const tagCounts = await RecipeModel.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $match: { _id: { $ne: "" } } },
      { $sort: { count: -1, _id: 1 } }
    ]);

    const sortedTags = tagCounts.map(t => t._id);
    const tagCountMap: Record<string, number> = {};
    tagCounts.forEach(t => {
      tagCountMap[t._id] = t.count;
    });

    return res.status(200).json({
      success: true,
      data: sortedTags,
      counts: tagCountMap,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteRecipe(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { id } = req.params;
    const existing = await RecipeModel.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    if (existing.author !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete recipes that you authored.',
      });
    }

    await RecipeModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyRecipes(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const myRecipes = await RecipeModel.find({ author: req.user._id.toString() }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: myRecipes,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
