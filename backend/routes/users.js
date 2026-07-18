const express = require('express');
const router = express.Router();
const { getAllUsers, getUser, updateProfile, changePassword, blockUser, deleteUser, getDashboardStats, getGlobalLeaderboard } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../utils/multer');

router.get('/leaderboard/public', getGlobalLeaderboard); // public - no auth needed
router.get('/leaderboard', protect, getGlobalLeaderboard);
router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/my-results', protect, async (req, res) => {
  try {
    const TestResult = require('../models/TestResult');
    const results = await TestResult.find({ userId: req.user._id })
      .populate('testId', 'title totalMarks passingMarks')
      .sort({ completedAt: -1 });
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);
router.put('/change-password', protect, changePassword);

// Admin routes
router.get('/', adminOnly, getAllUsers);
router.get('/:id', adminOnly, getUser);
router.put('/:id/block', adminOnly, blockUser);
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;
