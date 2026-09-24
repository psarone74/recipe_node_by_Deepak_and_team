import { Router } from 'express';
import { culinaryAdvisor } from '../controllers/aiController.js';

const router = Router();

router.post('/culinary-advisor', culinaryAdvisor);

export default router;
