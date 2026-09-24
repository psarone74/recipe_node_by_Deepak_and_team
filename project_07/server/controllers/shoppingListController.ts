import { Response } from 'express';
import { ShoppingListModel } from '../models/ShoppingList.js';
import { PantryItemModel } from '../models/PantryItem.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getShoppingList(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const items = await ShoppingListModel.find({ userId: req.user._id });

    // Group by category for aisle layout
    const aisleGroups: Record<string, typeof items> = {
      'Produce': [],
      'Dairy & Eggs': [],
      'Seafood & Meat': [],
      'Pantry & Spices': [],
      'Bakery': [],
      'Other': []
    };

    let totalEstimatedCost = 0;
    let completedCount = 0;

    for (const item of items) {
      if (item.checked) completedCount++;
      totalEstimatedCost += item.estimatedPrice || 2.50;

      const cat = (item.category || '').toLowerCase();
      if (cat.includes('produce') || cat.includes('veg') || cat.includes('fruit')) {
        aisleGroups['Produce'].push(item);
      } else if (cat.includes('dairy') || cat.includes('egg') || cat.includes('cheese')) {
        aisleGroups['Dairy & Eggs'].push(item);
      } else if (cat.includes('seafood') || cat.includes('meat') || cat.includes('fish')) {
        aisleGroups['Seafood & Meat'].push(item);
      } else if (cat.includes('bakery') || cat.includes('bread')) {
        aisleGroups['Bakery'].push(item);
      } else if (cat.includes('pantry') || cat.includes('spice') || cat.includes('grain')) {
        aisleGroups['Pantry & Spices'].push(item);
      } else {
        aisleGroups['Other'].push(item);
      }
    }

    return res.status(200).json({
      success: true,
      data: items,
      aisleGroups,
      summary: {
        totalItems: items.length,
        completedCount,
        pendingCount: items.length - completedCount,
        estimatedTotal: Number(totalEstimatedCost.toFixed(2)),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function addShoppingItem(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { ingredient, quantity, unit, category, estimatedPrice, recipeOrigin } = req.body;

    if (!ingredient || !ingredient.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Ingredient name is required.',
      });
    }

    const newItem = await ShoppingListModel.create({
      userId: req.user._id,
      ingredient: ingredient.trim(),
      quantity: quantity || 1,
      unit: unit || 'item',
      category: category || 'Pantry',
      checked: false,
      recipeOrigin: recipeOrigin || 'Manual Entry',
      estimatedPrice: estimatedPrice ? Number(estimatedPrice) : 2.50,
    });

    return res.status(201).json({
      success: true,
      message: `${ingredient} added to shopping list.`,
      data: newItem,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function toggleShoppingItem(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { id } = req.params;
    const existing = await ShoppingListModel.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const updated = await ShoppingListModel.findByIdAndUpdate(id, {
      checked: !existing.checked,
    }, { new: true });

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteShoppingItem(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { id } = req.params;
    const existing = await ShoppingListModel.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    await ShoppingListModel.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: 'Item removed from shopping list.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function clearCompletedItems(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const all = await ShoppingListModel.find({ userId: req.user._id, checked: true });
    for (const item of all) {
      if (item._id) await ShoppingListModel.findByIdAndDelete(item._id);
    }

    return res.status(200).json({
      success: true,
      message: `Cleared ${all.length} completed items.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function addMissingIngredients(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { ingredients, recipeTitle } = req.body;
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ingredients array is required.',
      });
    }

    const added: any[] = [];
    for (const ing of ingredients) {
      const name = typeof ing === 'string' ? ing : ing.name;
      if (!name) continue;

      const created = await ShoppingListModel.create({
        userId: req.user._id,
        ingredient: name.trim(),
        quantity: ing.quantity || 1,
        unit: ing.unit || 'item',
        category: ing.aisle || 'Pantry',
        checked: false,
        recipeOrigin: recipeTitle || 'Missing Ingredients',
        estimatedPrice: 2.50,
      });
      added.push(created);
    }

    return res.status(201).json({
      success: true,
      message: `Added ${added.length} missing ingredients to your shopping list!`,
      data: added,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Auto-stocks purchased shopping items directly into user's Pantry in MongoDB!
 * Can take all checked items or all shopping items.
 */
export async function autoStockToPantry(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { itemIds, onlyChecked = false } = req.body;
    let itemsToStock = [];

    if (Array.isArray(itemIds) && itemIds.length > 0) {
      itemsToStock = await ShoppingListModel.find({ userId: req.user._id });
      itemsToStock = itemsToStock.filter(i => itemIds.includes(i._id));
    } else if (onlyChecked) {
      itemsToStock = await ShoppingListModel.find({ userId: req.user._id, checked: true });
    } else {
      itemsToStock = await ShoppingListModel.find({ userId: req.user._id });
    }

    if (itemsToStock.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No shopping items selected for pantry auto-stocking.',
      });
    }

    const stockedPantryItems = [];

    for (const shopItem of itemsToStock) {
      // Check if already in pantry; if so, bump quantity
      const existingPantry = await PantryItemModel.findOne({
        userId: req.user._id,
        ingredient: shopItem.ingredient,
      });

      if (existingPantry) {
        const updated = await PantryItemModel.findByIdAndUpdate(existingPantry._id!, {
          quantity: `${existingPantry.quantity} + ${shopItem.quantity}`,
          updatedAt: new Date().toISOString(),
        }, { new: true });
        stockedPantryItems.push(updated);
      } else {
        const newPantry = await PantryItemModel.create({
          userId: req.user._id,
          ingredient: shopItem.ingredient,
          quantity: shopItem.quantity,
          unit: shopItem.unit,
          category: shopItem.category || 'Pantry',
          expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], // Default 14-day expiry
        });
        stockedPantryItems.push(newPantry);
      }

      // Remove from shopping list
      if (shopItem._id) {
        await ShoppingListModel.findByIdAndDelete(shopItem._id);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully transferred ${stockedPantryItems.length} items into your pantry!`,
      data: stockedPantryItems,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
