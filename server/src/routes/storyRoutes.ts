import { Router } from 'express';
import { adminAuthMiddleware } from '../middleware/auth';
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
  deleteStoryComment,
  getAllStoriesAdmin,
  getPendingStories,
  approveStory,
  rejectStory
} from '../controllers/storyController';

const router = Router();

// Admin routes (protected with JWT, place before :id routes)
router.get('/admin/all', adminAuthMiddleware, getAllStoriesAdmin);
router.get('/admin/pending', adminAuthMiddleware, getPendingStories);
router.patch('/admin/:id/approve', adminAuthMiddleware, approveStory);
router.delete('/admin/:id/reject', adminAuthMiddleware, rejectStory);

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
