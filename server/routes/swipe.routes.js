import { Router } from 'express';
import mongoose from 'mongoose';
import { Profile, Swipe } from '../models/index.js';
import { PUBLIC_FIELDS, toPublic } from '../utils/serializers.js';

const router = Router();

router.post('/swipe', async (req, res, next) => {
  try {
    const { profileId, action } = req.body ?? {};

    if (!mongoose.isValidObjectId(profileId)) {
      return res.status(400).json({ error: 'profileId is invalid' });
    }
    if (!['like', 'pass'].includes(action)) {
      return res.status(400).json({ error: "action must be 'like' or 'pass'" });
    }

    const profile = await Profile.findById(profileId)
      .select(`${PUBLIC_FIELDS} +likedMe`)
      .lean();
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Idempotent: the first swipe wins, repeats do not overwrite it.
    let swipe;
    try {
      swipe = await Swipe.findOneAndUpdate(
        { profile: profileId },
        { $setOnInsert: { action } },
        { upsert: true, new: true }
      );
    } catch (err) {
      if (err.code !== 11000) throw err; // two requests raced on the unique index
      swipe = await Swipe.findOne({ profile: profileId });
    }

    const match = swipe.action === 'like' && profile.likedMe === true;
    res.json({
      action: swipe.action,
      match,
      profile: match ? toPublic(profile) : undefined,
    });
  } catch (err) {
    next(err);
  }
});

export default router;