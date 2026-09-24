import { Router } from 'express';
import { getPantryMatches } from '../controllers/matchingController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getPantryMatches);
router.get('/recipes', authenticateToken, getPantryMatches);

export default router;
