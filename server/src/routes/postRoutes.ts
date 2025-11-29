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

const router = Router();

// Public routes
router.get('/', getPosts);
router.get('/search', searchPosts);
router.get('/slug/:slug', getPostBySlug);

// User routes
router.get('/user/:userId', getUserPosts);
router.post('/user', createUserPost);

// Admin routes
router.get('/admin/all', getAllPosts);
router.get('/admin/pending', getPendingPosts);
router.get('/admin/:id', getPostById);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.patch('/:id/publish', togglePublish);
router.patch('/:id/approve', approvePost);
router.delete('/:id/reject', rejectPost);

export default router;
