import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import pantryRoutes from './routes/pantryRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import shoppingRoutes from './routes/shoppingRoutes.js';
import mealPlanRoutes from './routes/mealPlanRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import externalRoutes from './routes/externalRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

export function createApp(): Express {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "connect-src": ["'self'", "ws://localhost:*", "http://localhost:*"],
        "img-src": ["'self'", "data:", "https://api.dicebear.com", "https://images.unsplash.com", "https://www.themealdb.com"],
      }
    },
    crossOriginEmbedderPolicy: false
  }));
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-production-url.com'] 
      : 'http://localhost:5173',
    credentials: true
  }));
  app.use(express.json());

  // Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
  });

  // Apply to all API routes
  app.use('/api', apiLimiter);


  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'RecipeMaster',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API modules
  app.use('/api/auth', authRoutes);
  app.use('/api/recipes', recipeRoutes);
  app.use('/api/pantry', pantryRoutes);
  app.use('/api/matching', matchingRoutes);
  app.use('/api/shopping-list', shoppingRoutes);
  app.use('/api/meal-plans', mealPlanRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/external-recipes', externalRoutes);
  app.use('/api/ai', aiRoutes);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
