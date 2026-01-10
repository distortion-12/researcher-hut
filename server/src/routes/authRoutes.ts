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
  sendUserPasswordResetOtp,
  resetUserPassword,
} from '../controllers/authController';
import { otpRateLimit } from '../middleware/auth';

const router = Router();

// Admin routes
router.get('/admin/settings', getAdminSettings);
router.post('/admin/send-otp', otpRateLimit(5 * 60 * 1000, 3), sendAdminOtp);
router.post('/admin/verify', verifyAdminLogin);
router.post('/admin/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out successfully' });
});
router.post('/admin/reset/send-otp', otpRateLimit(5 * 60 * 1000, 3), sendResetOtp);
router.post('/admin/reset', resetAdminCredentials);

// User signup routes
router.post('/signup/send-otp', otpRateLimit(5 * 60 * 1000, 3), sendUserSignupOtp);
router.post('/signup/verify', verifyUserSignupOtp);

// Email change routes
router.post('/email/send-otp', otpRateLimit(5 * 60 * 1000, 3), sendEmailChangeOtp);
router.post('/email/verify', verifyEmailChange);

// Password reset routes
router.post('/password/send-reset-otp', otpRateLimit(5 * 60 * 1000, 3), sendUserPasswordResetOtp);
router.post('/password/reset', resetUserPassword);

export default router;
