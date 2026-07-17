const express = require('express');
const router = express.Router();
const { register, login, adminLogin, getMe, setupAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/admin/setup', setupAdmin);
router.get('/me', protect, getMe);

module.exports = router;
