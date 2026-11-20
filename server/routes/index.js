import { Router } from 'express';
import healthRoutes from './health.routes.js';
import feedRoutes from './feed.routes.js';
import swipeRoutes from './swipe.routes.js';
import matchesRoutes from './matches.routes.js';
import resetRoutes from './reset.routes.js';

const router = Router();

router.use(healthRoutes);
router.use(feedRoutes);
router.use(swipeRoutes);
router.use(matchesRoutes);
router.use(resetRoutes);

export default router;