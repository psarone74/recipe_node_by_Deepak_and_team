import { Router } from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getMyRecipes,
  getAllTags,
} from '../controllers/recipeController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public routes (with optional auth to show pantry match)
router.get('/', getRecipes);
router.get('/tags', getAllTags);
router.get('/my-recipes', authenticateToken, getMyRecipes);
router.get('/:id', optionalAuth, getRecipeById);

// Protected CRUD routes
router.post('/', authenticateToken, createRecipe);
router.put('/:id', authenticateToken, updateRecipe);
router.delete('/:id', authenticateToken, deleteRecipe);

export default router;
