const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { subjectId, classId } = req.query;
    const query = { isActive: true };
    if (subjectId) query.subjectId = subjectId;
    if (classId) query.classId = classId;
    
    const chapters = await Chapter.find(query)
      .populate('subjectId', 'name color')
      .populate('classId', 'name grade')
      .sort('order chapterNumber');
    res.json({ success: true, data: chapters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id)
      .populate('subjectId', 'name color')
      .populate('classId', 'name grade');
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });
    res.json({ success: true, data: chapter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const chapter = await Chapter.create(req.body);
    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', adminOnly, async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: chapter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await Chapter.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Chapter deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
