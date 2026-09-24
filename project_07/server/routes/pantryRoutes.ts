import { Router } from 'express';
import {
  getPantry,
  addPantryItem,
  updatePantryItem,
  deletePantryItem,
  quickAddPantryItems,
} from '../controllers/pantryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getPantry);
router.post('/', addPantryItem);
router.post('/quick-add', quickAddPantryItems);
router.put('/:id', updatePantryItem);
router.delete('/:id', deletePantryItem);

export default router;
