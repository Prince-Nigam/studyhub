const express = require('express');
const router = express.Router();
const { getAllUsers, getUser, updateProfile, changePassword, blockUser, deleteUser, getDashboardStats } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../utils/multer');

router.get('/dashboard-stats', protect, getDashboardStats);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);
router.put('/change-password', protect, changePassword);

// Admin routes
router.get('/', adminOnly, getAllUsers);
router.get('/:id', adminOnly, getUser);
router.put('/:id/block', adminOnly, blockUser);
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;
