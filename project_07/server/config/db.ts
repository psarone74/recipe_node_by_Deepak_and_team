import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';

let mongoServer: MongoMemoryServer;

export const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI as string;
    
    // Auto-spin in-memory server if it's the default local string or missing
    if (!uri || uri.includes('127.0.0.1:27017')) {
      console.log('No external MongoDB URI detected. Spinning up in-memory replica...');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }
    
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default user for testing if using in-memory
    if (mongoServer) {
        const count = await UserModel.countDocuments();
        if (count === 0) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await UserModel.create({
                name: 'Master Chef',
                email: 'chef@example.com',
                passwordHash: hashedPassword,
                profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=Master%20Chef&backgroundColor=003629',
                dietaryPreferences: []
            });
            console.log('🌱 Seeded default user: chef@example.com / password123');
        }
    }
  } catch (error: any) {
    console.error(`Database not connected: ${error.message} - Running in UI-only mode.`);
  }
};
