import mongoose, { Document, Schema } from 'mongoose';

export interface IPantryItem extends Document {
  userId: mongoose.Types.ObjectId;
  ingredient: string;
  normalizedIngredient?: string;
  quantity: number | string;
  unit: string;
  category?: string;
  expiryDate?: Date;
}

const pantryItemSchema = new Schema<IPantryItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ingredient: { type: String, required: true },
    normalizedIngredient: { type: String },
    quantity: { type: Schema.Types.Mixed, required: true },
    unit: { type: String, required: true },
    category: { type: String },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

pantryItemSchema.index({ userId: 1 });

export const PantryItemModel = mongoose.model<IPantryItem>('PantryItem', pantryItemSchema);
