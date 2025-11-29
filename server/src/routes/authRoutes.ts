import { Router } from 'express';
import {
  getAdminSettings,
  sendAdminOtp,
  verifyAdminLogin,
  sendResetOtp,
  resetAdminCredentials,
  sendUserSignupOtp,
  verifyUserSignupOtp,
  sendEmailChangeOtp,
  verifyEmailChange,
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

// Email change routes
router.post('/email/send-otp', sendEmailChangeOtp);
router.post('/email/verify', verifyEmailChange);

export default router;
