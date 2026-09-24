import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  profileImage?: string;
  dietaryPreferences?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    profileImage: { type: String },
    dietaryPreferences: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', userSchema);
