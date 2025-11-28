import { Router } from 'express';
import {
  getAdminSettings,
  sendAdminOtp,
  verifyAdminLogin,
  sendResetOtp,
  resetAdminCredentials,
  sendUserSignupOtp,
  verifyUserSignupOtp,
} from '../controllers/authController';

const router = Router();

// Admin routes
router.get('/admin/settings', getAdminSettings);
router.post('/admin/send-otp', sendAdminOtp);
router.post('/admin/verify', verifyAdminLogin);
router.post('/admin/reset/send-otp', sendResetOtp);
router.post('/admin/reset', resetAdminCredentials);

// User signup routes
router.post('/signup/send-otp', sendUserSignupOtp);
router.post('/signup/verify', verifyUserSignupOtp);

export default router;
