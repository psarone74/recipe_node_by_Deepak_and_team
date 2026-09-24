import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'recipemaster_jwt_super_secure_secret_key_2026';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, confirmPassword, dietaryPreferences } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation does not match.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashedPassword,
      profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=003629`,
      dietaryPreferences: Array.isArray(dietaryPreferences) ? dietaryPreferences : [],
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userSafe } = newUser.toObject();

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to RecipeMaster.',
      data: {
        user: userSafe,
        token,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during registration.',
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userSafe } = user.toObject();

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: userSafe,
        token,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during login.',
    });
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }
    const { passwordHash: _, ...userSafe } = (req.user as any).toObject ? (req.user as any).toObject() : req.user;
    return res.status(200).json({
      success: true,
      data: userSafe,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { name, dietaryPreferences, profileImage } = req.body;
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (Array.isArray(dietaryPreferences)) updateData.dietaryPreferences = dietaryPreferences;
    if (profileImage) updateData.profileImage = profileImage;

    const updated = await UserModel.findByIdAndUpdate(req.user._id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { passwordHash: _, ...userSafe } = updated.toObject();
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: userSafe,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const user = await UserModel.findById(req.user._id);
    if (!user || !user.passwordHash) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password incorrect.',
      });
    }

    const newHashed = await bcrypt.hash(newPassword, 10);
    await UserModel.findByIdAndUpdate(user._id!, { passwordHash: newHashed });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
