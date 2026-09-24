import { Router } from 'express';
import {
  searchExternalRecipes,
  getExternalRecipeById,
  getRandomExternalRecipe,
  importExternalRecipe,
} from '../controllers/externalRecipeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/search', searchExternalRecipes);
router.get('/random', getRandomExternalRecipe);
router.get('/:id', getExternalRecipeById);
router.post('/import', authenticateToken, importExternalRecipe);

export default router;
