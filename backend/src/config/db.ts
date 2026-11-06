import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';


export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || '');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
