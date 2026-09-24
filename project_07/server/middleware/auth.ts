import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'recipemaster_jwt_super_secure_secret_key_2026';

export interface AuthRequest extends Request {
  user?: IUser;
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization token provided.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: User account not found.',
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      const user = await UserModel.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (e) {
    // Continue unauthenticated if token is invalid or absent
    next();
  }
}
