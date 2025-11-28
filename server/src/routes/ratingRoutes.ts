import { Router } from 'express';
import {
  getRatings,
  getUserRating,
  upsertRating,
} from '../controllers/ratingController';

const router = Router();

router.get('/:postId', getRatings);
router.get('/:postId/user/:userId', getUserRating);
router.post('/:postId', upsertRating);

export default router;
