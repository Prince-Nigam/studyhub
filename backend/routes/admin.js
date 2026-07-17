const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Class = require('../models/Class');
const Note = require('../models/Note');
const Video = require('../models/Video');
const Test = require('../models/Test');
const Announcement = require('../models/Announcement');
const { adminOnly } = require('../middleware/auth');

// @desc    Admin dashboard stats
// @route   GET /api/admin/stats
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const [
      totalUsers,
      totalClasses,
      totalNotes,
      totalVideos,
      totalTests,
      recentUsers,
      activeUsers
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Class.countDocuments({ isActive: true }),
      Note.countDocuments({ isActive: true }),
      Video.countDocuments({ isActive: true }),
      Test.countDocuments({ isActive: true, isPublished: true }),
      User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(5).select('fullName email createdAt'),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
    ]);

    // Monthly user growth
    const monthlyData = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalClasses,
        totalNotes,
        totalVideos,
        totalTests,
        activeUsers,
        recentUsers,
        monthlyData: monthlyData.reverse()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
