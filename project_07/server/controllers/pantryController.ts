import { Response } from 'express';
import { PantryItemModel } from '../models/PantryItem.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getPantry(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) return res.status(401).json({ success: false, message: 'Unauthenticated.' });

    const { search, category, sort } = req.query;
    const query: any = { userId: req.user._id };

    if (search && typeof search === 'string' && search.trim() !== '') {
      query.ingredient = { $regex: search.trim(), $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    let sortOption: any = { expiryDate: 1, createdAt: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    
    // Items with no expiryDate will incorrectly sort to the top if we aren't careful, but mongodb handles nulls at the top.
    // For now we'll just sort natively.
    
    const items = await PantryItemModel.find(query).sort(sortOption);

    return res.status(200).json({
      success: true,
      data: items,
      totalCount: items.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function addPantryItem(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) return res.status(401).json({ success: false, message: 'Unauthenticated.' });

    const { ingredient, quantity, unit, category, expiryDate } = req.body;

    if (!ingredient || !ingredient.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Ingredient name is required.',
      });
    }

    const existing = await PantryItemModel.findOne({
      userId: req.user._id,
      ingredient: { $regex: new RegExp(`^${ingredient.trim()}$`, 'i') },
    });

    if (existing) {
      const updated = await PantryItemModel.findByIdAndUpdate(existing._id, {
        quantity: quantity || existing.quantity,
        unit: unit || existing.unit,
        category: category || existing.category,
        expiryDate: expiryDate || existing.expiryDate,
      }, { new: true });

      return res.status(200).json({
        success: true,
        message: `${ingredient} updated in your pantry.`,
        data: updated,
      });
    }

    const newItem = await PantryItemModel.create({
      userId: req.user._id,
      ingredient: ingredient.trim(),
      quantity: quantity || 1,
      unit: unit || 'item',
      category: category || autoCategorize(ingredient.trim()),
      expiryDate: expiryDate || undefined,
    });

    return res.status(201).json({
      success: true,
      message: `${ingredient} added to your pantry.`,
      data: newItem,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updatePantryItem(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) return res.status(401).json({ success: false, message: 'Unauthenticated.' });

    const { id } = req.params;
    const existing = await PantryItemModel.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Pantry item not found.' });
    }

    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const updated = await PantryItemModel.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json({
      success: true,
      message: 'Pantry item updated.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deletePantryItem(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) return res.status(401).json({ success: false, message: 'Unauthenticated.' });

    const { id } = req.params;
    const existing = await PantryItemModel.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Pantry item not found.' });
    }

    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    await PantryItemModel.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: 'Pantry item removed.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function quickAddPantryItems(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) return res.status(401).json({ success: false, message: 'Unauthenticated.' });

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array is required.' });
    }

    const createdList = [];
    for (const item of items) {
      const name = typeof item === 'string' ? item : item.name || item.ingredient;
      if (!name) continue;

      const created = await PantryItemModel.create({
        userId: req.user._id,
        ingredient: name.trim(),
        quantity: item.quantity || 1,
        unit: item.unit || 'unit',
        category: item.category || autoCategorize(name.trim()),
        expiryDate: item.expiryDate || undefined,
      });
      createdList.push(created);
    }

    return res.status(201).json({
      success: true,
      message: `Added ${createdList.length} items to pantry.`,
      data: createdList,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

function autoCategorize(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('garlic') || lower.includes('onion') || lower.includes('tomato') || lower.includes('potato') || lower.includes('avocado') || lower.includes('lemon') || lower.includes('cucumber') || lower.includes('spinach') || lower.includes('herb') || lower.includes('basil')) return 'Produce';
  if (lower.includes('milk') || lower.includes('cheese') || lower.includes('butter') || lower.includes('cream') || lower.includes('egg') || lower.includes('yogurt') || lower.includes('paneer')) return 'Dairy';
  if (lower.includes('chicken') || lower.includes('beef') || lower.includes('pork') || lower.includes('bacon') || lower.includes('turkey')) return 'Meat';
  if (lower.includes('salmon') || lower.includes('fish') || lower.includes('shrimp') || lower.includes('tuna') || lower.includes('prawn')) return 'Seafood';
  if (lower.includes('bread') || lower.includes('toast') || lower.includes('bun') || lower.includes('sourdough')) return 'Bakery';
  return 'Pantry';
}
