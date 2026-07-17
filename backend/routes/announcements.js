const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', adminOnly, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
