import mongoose, { Document, Schema } from 'mongoose';

export interface IMealPlan extends Document {
  userId: mongoose.Types.ObjectId;
  recipeId: string;
  recipeTitle?: string;
  recipeImage?: string;
  cookTime?: number;
  date: string; 
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
  calories?: number;
  completed?: boolean;
}

const mealPlanSchema = new Schema<IMealPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipeId: { type: String, required: true },
    recipeTitle: { type: String },
    recipeImage: { type: String },
    cookTime: { type: Number },
    date: { type: String, required: true },
    mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
    notes: { type: String },
    calories: { type: Number },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

mealPlanSchema.index({ userId: 1, date: 1 });

export const MealPlanModel = mongoose.model<IMealPlan>('MealPlan', mealPlanSchema);
