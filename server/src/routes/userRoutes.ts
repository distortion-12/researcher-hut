import { Router } from 'express';
import {
  checkUsername,
  getUserById,
  createUser,
} from '../controllers/userController';

const router = Router();

router.get('/check-username/:username', checkUsername);
router.get('/:id', getUserById);
router.post('/', createUser);

export default router;
