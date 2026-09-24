const express = require('express');
const router = express.Router();
const {
  register,
  login,
  adminLogin,
  getMe,
  setupAdmin,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/admin/setup', setupAdmin);
router.get('/me', protect, getMe);

// ── Forgot Password (OTP flow) ─────────────────────────────────────────────
router.post('/forgot-password', forgotPassword);   // step 1: send OTP
router.post('/verify-otp', verifyOtp);             // step 2: verify OTP
router.post('/reset-password', resetPassword);     // step 3: set new password

module.exports = router;
