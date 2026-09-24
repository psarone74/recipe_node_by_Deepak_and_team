import { Router } from 'express';
import {
  getShoppingList,
  addShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  clearCompletedItems,
  addMissingIngredients,
  autoStockToPantry,
} from '../controllers/shoppingListController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getShoppingList);
router.post('/', addShoppingItem);
router.post('/add-missing', addMissingIngredients);
router.post('/auto-stock', autoStockToPantry);
router.put('/:id/toggle', toggleShoppingItem);
router.delete('/completed', clearCompletedItems);
router.delete('/:id', deleteShoppingItem);

export default router;
