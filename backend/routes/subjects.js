const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const { protect, adminOnly } = require('../middleware/auth');

// Get subjects
router.get('/', protect, async (req, res) => {
  try {
    const { classId } = req.query;
    const query = { isActive: true };
    if (classId) query.classId = classId;
    
    const subjects = await Subject.find(query)
      .populate('classId', 'name grade')
      .sort('order');
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single subject with chapters
router.get('/:id', protect, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('classId', 'name grade');
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    
    const chapters = await Chapter.find({ subjectId: req.params.id, isActive: true }).sort('order chapterNumber');
    res.json({ success: true, data: { ...subject.toObject(), chapters } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin routes
router.post('/', adminOnly, async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', adminOnly, async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
