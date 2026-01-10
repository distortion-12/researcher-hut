import { Router } from 'express';
import {
  getPosts,
  getAllPosts,
  getPendingPosts,
  getUserPosts,
  getPostBySlug,
  getPostById,
  createPost,
  createUserPost,
  updatePost,
  deletePost,
  togglePublish,
  approvePost,
  rejectPost,
  searchPosts,
} from '../controllers/postController';
import { adminAuthMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getPosts);
router.get('/search', searchPosts);
router.get('/slug/:slug', getPostBySlug);

// User routes
router.get('/user/:userId', getUserPosts);
router.post('/user', createUserPost);

// Admin routes (protected with JWT)
router.get('/admin/all', adminAuthMiddleware, getAllPosts);
router.get('/admin/pending', adminAuthMiddleware, getPendingPosts);
router.get('/admin/:id', adminAuthMiddleware, getPostById);
router.post('/', adminAuthMiddleware, createPost);
router.put('/:id', adminAuthMiddleware, updatePost);
router.delete('/:id', adminAuthMiddleware, deletePost);
router.patch('/:id/publish', adminAuthMiddleware, togglePublish);
router.patch('/:id/approve', adminAuthMiddleware, approvePost);
router.delete('/:id/reject', adminAuthMiddleware, rejectPost);

export default router;
