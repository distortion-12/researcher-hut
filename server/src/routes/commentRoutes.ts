import { Router } from 'express';
import {
  getComments,
  createComment,
  deleteComment,
} from '../controllers/commentController';

const router = Router();

router.get('/:postId', getComments);
router.post('/:postId', createComment);
router.delete('/:id', deleteComment);

export default router;
