import { Router } from 'express';
import {
  getPosts,
  getAllPosts,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  togglePublish,
} from '../controllers/postController';

const router = Router();

// Public routes
router.get('/', getPosts);
router.get('/slug/:slug', getPostBySlug);

// Admin routes
router.get('/admin/all', getAllPosts);
router.get('/admin/:id', getPostById);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.patch('/:id/publish', togglePublish);

export default router;
