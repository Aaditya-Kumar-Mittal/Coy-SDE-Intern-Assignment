import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  photo: { type: String, required: true },
  bio: { type: String, required: true },
  city: { type: String, required: true },
  interests: { type: [String], default: [] },
  likedMe: { type: Boolean, default: false, select: false },
});

export const Profile = mongoose.model('Profile', profileSchema);