import { Router } from 'express';
import { Profile, Swipe } from '../models/index.js';
import { PUBLIC_FIELDS } from '../utils/serializers.js';

const router = Router();

router.get('/feed', async (_req, res, next) => {
  try {
    const swipedIds = await Swipe.distinct('profile');
    const profiles = await Profile.find({ _id: { $nin: swipedIds } })
      .select(PUBLIC_FIELDS)
      .sort({ _id: 1 })
      .lean();
    res.json({ profiles });
  } catch (err) {
    next(err);
  }
});

export default router;