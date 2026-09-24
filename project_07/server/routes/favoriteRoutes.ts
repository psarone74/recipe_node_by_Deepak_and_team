import { Router } from 'express';
import { toggleFavorite, getFavorites } from '../controllers/favoriteController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getFavorites);
router.post('/toggle', toggleFavorite);

export default router;
