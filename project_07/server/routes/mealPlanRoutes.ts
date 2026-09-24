import { Router } from 'express';
import {
  getWeeklyPlan,
  addMeal,
  updateMeal,
  deleteMeal,
  getTodayMeals,
} from '../controllers/mealPlanController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/weekly', getWeeklyPlan);
router.get('/today', getTodayMeals);
router.post('/', addMeal);
router.put('/:id', updateMeal);
router.delete('/:id', deleteMeal);

export default router;
