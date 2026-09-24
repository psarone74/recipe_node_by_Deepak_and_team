import mongoose, { Document, Schema } from 'mongoose';

export interface IIngredient {
  name: string;
  quantity: number | string;
  unit: string;
  aisle?: string;
  category?: string;
}

export interface IRecipe extends Document {
  title: string;
  description: string;
  image: string;
  author: string; // Could be a User ObjectId or string mapping for external
  authorName?: string;
  ingredients: IIngredient[];
  instructions: string[];
  cuisine: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: number; 
  cookTime: number; 
  servings: number;
  tags: string[]; 
  dietaryType: string;
  calories?: number;
  isExternal?: boolean;
  externalSourceUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Keeping original normalization helpers
export function formatTag(tag: string): string {
  if (!tag || typeof tag !== 'string') return '';
  let cleaned = tag.trim().replace(/^#+/, '').replace(/\s+/g, ' ');
  if (cleaned.length < 2 || cleaned.length > 35) return '';
  return cleaned.split(' ').map((word) => word.split('-').map((sub) => (sub.length > 0 ? sub.charAt(0).toUpperCase() + sub.slice(1) : '')).join('-')).join(' ');
}

export function sanitizeRecipeTags(input: any): string[] {
  if (!input) return [];
  const rawTags: string[] = Array.isArray(input) ? input : typeof input === 'string' ? input.split(',') : [];
  const seen = new Set<string>();
  const sanitized: string[] = [];
  for (const raw of rawTags) {
    const formatted = formatTag(raw);
    if (formatted) {
      const lowerKey = formatted.toLowerCase();
      if (!seen.has(lowerKey)) {
        seen.add(lowerKey);
        sanitized.push(formatted);
      }
    }
  }
  return sanitized;
}

const ingredientSchema = new Schema<IIngredient>({
  name: { type: String, required: true },
  quantity: { type: Schema.Types.Mixed, required: true },
  unit: { type: String, required: true },
  aisle: { type: String },
  category: { type: String },
}, { _id: false });

const recipeSchema = new Schema<IRecipe>({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  author: { type: String, required: true },
  authorName: { type: String },
  ingredients: { type: [ingredientSchema], default: [] },
  instructions: { type: [String], default: [] },
  cuisine: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  prepTime: { type: Number, required: true },
  cookTime: { type: Number, required: true },
  servings: { type: Number, required: true },
  tags: { type: [String], default: [], index: true },
  dietaryType: { type: String },
  calories: { type: Number },
  isExternal: { type: Boolean, default: false },
  externalSourceUrl: { type: String },
}, { timestamps: true });

export const RecipeModel = mongoose.model<IRecipe>('Recipe', recipeSchema);
