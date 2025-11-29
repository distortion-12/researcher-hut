import { Router } from 'express';
import {
  checkUsername,
  getUserById,
  createUser,
  updateUser,
  checkUsernameChangeAllowed,
} from '../controllers/userController';

const router = Router();

router.get('/check-username/:username', checkUsername);
router.get('/:id', getUserById);
router.get('/:id/username-change-status', checkUsernameChangeAllowed);
router.post('/', createUser);
router.put('/:id', updateUser);

export default router;
