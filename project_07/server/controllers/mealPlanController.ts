import { Response } from 'express';
import { MealPlanModel } from '../models/MealPlan.js';
import { RecipeModel } from '../models/Recipe.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getWeeklyPlan(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { startDate, endDate } = req.query;

    const query: any = { userId: req.user._id };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const meals = await MealPlanModel.find(query).sort({ date: 1 });

    const groupedData: Record<string, Record<string, any[]>> = {};
    let totalMeals = 0;
    let totalEstimatedCalories = 0;
    let estimatedCookMinutes = 0;

    for (const meal of meals) {
      const d = meal.date;
      if (!groupedData[d]) {
        groupedData[d] = {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: [],
        };
      }
      if (!groupedData[d][meal.mealType]) {
        groupedData[d][meal.mealType] = [];
      }
      groupedData[d][meal.mealType].push(meal);

      totalMeals++;
      totalEstimatedCalories += (meal.calories || 0);
      estimatedCookMinutes += (meal.cookTime || 0);
    }

    return res.status(200).json({
      success: true,
      data: groupedData,
      summary: {
        totalMeals,
        totalEstimatedCalories,
        estimatedCookMinutes,
      },
      totalCount: meals.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function addMeal(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { recipeId, date, mealType, notes } = req.body;

    if (!recipeId || !date || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Recipe, date (YYYY-MM-DD), and mealType are required.',
      });
    }

    const recipe = await RecipeModel.findById(recipeId);

    const newMeal = await MealPlanModel.create({
      userId: req.user._id,
      recipeId,
      recipeTitle: recipe?.title || 'Custom Meal',
      recipeImage: recipe?.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop',
      cookTime: recipe?.cookTime || 20,
      calories: recipe?.calories || 420,
      date,
      mealType,
      notes: notes || '',
      completed: false,
    });

    return res.status(201).json({
      success: true,
      message: `Added ${newMeal.recipeTitle} to meal plan.`,
      data: newMeal,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateMeal(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { id } = req.params;
    const existing = await MealPlanModel.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Meal plan entry not found.' });
    }

    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const updated = await MealPlanModel.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteMeal(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { id } = req.params;
    const existing = await MealPlanModel.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Meal entry not found.' });
    }

    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    await MealPlanModel.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: 'Meal removed from planner.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getTodayMeals(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const meals = await MealPlanModel.find({
      userId: req.user._id,
      date: todayStr,
    });

    return res.status(200).json({
      success: true,
      data: meals,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
