import { Router } from 'express';
import { Swipe } from '../models/index.js';
import { PUBLIC_FIELDS, toPublic } from '../utils/serializers.js';

const router = Router();

router.get('/matches', async (_req, res, next) => {
  try {
    const likes = await Swipe.find({ action: 'like' })
      .populate({ path: 'profile', select: `${PUBLIC_FIELDS} +likedMe` })
      .sort({ createdAt: -1 })
      .lean();

    const matches = likes
      .filter((s) => s.profile && s.profile.likedMe === true)
      .map((s) => ({ matchedAt: s.createdAt, profile: toPublic(s.profile) }));

    res.json({ matches });
  } catch (err) {
    next(err);
  }
});

export default router;