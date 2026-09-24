import mongoose, { Document, Schema } from 'mongoose';

export interface IShoppingItem extends Document {
  userId: mongoose.Types.ObjectId;
  ingredient: string;
  quantity: number | string;
  unit: string;
  category?: string;
  checked: boolean;
  sourceRecipeId?: string;
  recipeOrigin?: string;
  estimatedPrice?: number;
}

const shoppingListSchema = new Schema<IShoppingItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ingredient: { type: String, required: true },
    quantity: { type: Schema.Types.Mixed, required: true },
    unit: { type: String, required: true },
    category: { type: String },
    checked: { type: Boolean, default: false },
    sourceRecipeId: { type: String },
    recipeOrigin: { type: String },
    estimatedPrice: { type: Number },
  },
  { timestamps: true }
);

export const ShoppingListModel = mongoose.model<IShoppingItem>('ShoppingItem', shoppingListSchema);
