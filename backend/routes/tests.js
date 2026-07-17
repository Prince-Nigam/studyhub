const express = require('express');
const router = express.Router();
const { getTests, getTest, submitTest, getLeaderboard, createTest, updateTest, deleteTest } = require('../controllers/testController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getTests);
router.get('/:id', protect, getTest);
router.post('/:id/submit', protect, submitTest);
router.get('/:id/leaderboard', protect, getLeaderboard);

// Admin routes
router.post('/', adminOnly, createTest);
router.put('/:id', adminOnly, updateTest);
router.delete('/:id', adminOnly, deleteTest);

module.exports = router;
