import { Router } from 'express';
import {
  getAllStories,
  getStoryById,
  getUserStories,
  createStory,
  updateStory,
  deleteStory,
  toggleHelpful,
  checkHelpful,
  getStoryComments,
  addStoryComment,
  deleteStoryComment
} from '../controllers/storyController';

const router = Router();

// Story routes
router.get('/', getAllStories);
router.get('/:id', getStoryById);
router.get('/user/:userId', getUserStories);
router.post('/', createStory);
router.put('/:id', updateStory);
router.delete('/:id', deleteStory);

// Helpful routes
router.post('/:id/helpful', toggleHelpful);
router.get('/:id/helpful/:userId', checkHelpful);

// Comment routes
router.get('/:id/comments', getStoryComments);
router.post('/:id/comments', addStoryComment);
router.delete('/comments/:commentId', deleteStoryComment);

export default router;
