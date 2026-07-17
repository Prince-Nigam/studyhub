const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Video = require('../models/Video');
const Test = require('../models/Test');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const { protect } = require('../middleware/auth');

// @desc    Global search
// @route   GET /api/search?q=query
router.get('/', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: { notes: [], videos: [], tests: [], classes: [], subjects: [] } });
    }

    const regex = { $regex: q, $options: 'i' };
    const limit = 5;

    const [notes, videos, tests, classes, subjects] = await Promise.all([
      Note.find({ title: regex, isActive: true }).limit(limit).select('title type subjectId').populate('subjectId', 'name'),
      Video.find({ title: regex, isActive: true }).limit(limit).select('title thumbnailUrl duration youtubeId').populate('subjectId', 'name'),
      Test.find({ title: regex, isActive: true, isPublished: true }).limit(limit).select('title totalQuestions timeLimit').populate('subjectId', 'name'),
      Class.find({ name: regex, isActive: true }).limit(limit).select('name grade'),
      Subject.find({ name: regex, isActive: true }).limit(limit).select('name color').populate('classId', 'name grade')
    ]);

    res.json({ success: true, data: { notes, videos, tests, classes, subjects } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
