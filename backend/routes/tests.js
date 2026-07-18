const express = require('express');
const router = express.Router();
const { getTests, getTest, submitTest, getLeaderboard, createTest, updateTest, deleteTest } = require('../controllers/testController');
const { protect, adminOnly } = require('../middleware/auth');
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const { notifyAll } = require('../utils/notify');

router.get('/', protect, getTests);
router.get('/:id', protect, getTest);
router.post('/:id/submit', protect, submitTest);
router.get('/:id/leaderboard', protect, getLeaderboard);

// Admin — get all results for a test
router.get('/:id/results', adminOnly, async (req, res) => {
  try {
    const results = await TestResult.find({ testId: req.params.id })
      .populate('userId', 'fullName email selectedClass profilePicture')
      .sort({ score: -1 });
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin — manually upload/set result for a student
router.post('/:id/results/upload', adminOnly, async (req, res) => {
  try {
    const { userId, score, totalMarks, percentage, passed, remarks } = req.body;

    if (!userId || score === undefined || !totalMarks) {
      return res.status(400).json({ success: false, message: 'userId, score and totalMarks are required' });
    }

    const pct = percentage ?? parseFloat(((score / totalMarks) * 100).toFixed(2));

    const result = await TestResult.findOneAndUpdate(
      { testId: req.params.id, userId },
      {
        testId: req.params.id,
        userId,
        score,
        totalMarks,
        percentage: pct,
        passed: passed ?? pct >= 40,
        remarks: remarks || '',
        answers: [],
        completedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: false }
    );

    // Update user test history
    await User.findByIdAndUpdate(userId, {
      $inc: { 'studyProgress.totalTestsAttempted': 1 },
    });

    // Notify the student
    const Test = require('../models/Test');
    const test = await Test.findById(req.params.id).select('title');
    const Notification = require('../models/Notification');
    await Notification.create({
      userId,
      isGlobal: false,
      title: '📊 Result Published',
      message: `Your result for "${test?.title || 'Test'}" has been uploaded. Score: ${score}/${totalMarks} (${pct}%)`,
      type: 'success',
      link: '/dashboard/results',
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: result, message: 'Result uploaded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin — bulk upload results
router.post('/:id/results/bulk', adminOnly, async (req, res) => {
  try {
    const { results } = req.body; // [{ userId, score, totalMarks, passed }]
    if (!results?.length) return res.status(400).json({ success: false, message: 'results array required' });

    const Test = require('../models/Test');
    const Notification = require('../models/Notification');
    const test = await Test.findById(req.params.id).select('title totalMarks');

    const ops = results.map(r => {
      const pct = parseFloat(((r.score / (r.totalMarks || test?.totalMarks || 100)) * 100).toFixed(2));
      return {
        updateOne: {
          filter: { testId: req.params.id, userId: r.userId },
          update: {
            testId: req.params.id, userId: r.userId,
            score: r.score, totalMarks: r.totalMarks || test?.totalMarks,
            percentage: pct, passed: r.passed ?? pct >= 40,
            answers: [], completedAt: new Date(),
          },
          upsert: true,
        }
      };
    });

    await TestResult.bulkWrite(ops);

    // Notify all students
    await notifyAll({
      title: '📊 Results Published',
      message: `Results for "${test?.title || 'Test'}" have been published. Check your dashboard!`,
      type: 'success',
      link: '/dashboard/results',
      adminId: req.user._id,
    });

    res.json({ success: true, message: `${results.length} results uploaded` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin routes
router.post('/', adminOnly, createTest);
router.put('/:id', adminOnly, updateTest);
router.delete('/:id', adminOnly, deleteTest);

module.exports = router;
