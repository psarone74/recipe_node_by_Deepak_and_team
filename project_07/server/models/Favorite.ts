import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  recipeId: string;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipeId: { type: String, required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export const FavoriteModel = mongoose.model<IFavorite>('Favorite', favoriteSchema);
