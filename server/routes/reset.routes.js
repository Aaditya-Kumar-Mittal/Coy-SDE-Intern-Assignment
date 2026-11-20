import { Router } from 'express';
import { Swipe } from '../models/index.js';

const router = Router();

/** Demo helper: forget all swipes so the demo can be replayed. Disabled in production cases. */
router.post('/reset', async (_req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Disabled' });
    }
    await Swipe.deleteMany({});
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;