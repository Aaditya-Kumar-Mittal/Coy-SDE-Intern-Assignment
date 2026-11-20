import mongoose from 'mongoose';
import { Swipe } from '../models/index.js';

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is missing. Copy .env.example to .env and fill it in.'
    );
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
  await Swipe.init();
}