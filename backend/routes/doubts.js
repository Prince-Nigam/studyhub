const express = require('express');
const router  = express.Router();
const Doubt   = require('../models/Doubt');
const { protect, adminOnly } = require('../middleware/auth');
const Notification = require('../models/Notification');

// ── Get all doubts (with filters) ──────────────────
router.get('/', protect, async (req, res) => {
  try {
    const { subjectId, classId, status, mine } = req.query;
    const query = {};
    if (subjectId) query.subjectId = subjectId;
    if (classId)   query.classId   = classId;
    if (status)    query.status    = status;
    if (mine === 'true') query.userId = req.user._id;

    const doubts = await Doubt.find(query)
      .populate('userId', 'fullName profilePicture selectedClass')
      .populate('subjectId', 'name')
      .populate('chapterId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: doubts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Ask a doubt ─────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, subject, subjectId, chapterId, classId } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description required' });
    }
    const doubt = await Doubt.create({
      userId: req.user._id, title, description,
      subject, subjectId, chapterId, classId,
    });
    await doubt.populate('userId', 'fullName profilePicture selectedClass');
    res.status(201).json({ success: true, data: doubt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Reply to a doubt ────────────────────────────────
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Reply text required' });

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });

    const isAdmin = req.user.role === 'admin';
    const reply = {
      text,
      repliedBy: req.user._id,
      repliedByModel: isAdmin ? 'Admin' : 'User',
      repliedByName: req.user.fullName,
      isAdmin,
    };

    doubt.replies.push(reply);
    if (isAdmin) doubt.status = 'answered';
    await doubt.save();

    // Notify the student who asked
    if (!doubt.userId.equals(req.user._id)) {
      await Notification.create({
        userId: doubt.userId,
        isGlobal: false,
        title: isAdmin ? '✅ Admin answered your doubt!' : '💬 Someone replied to your doubt',
        message: `"${doubt.title}" — ${text.substring(0, 80)}`,
        type: 'info',
        link: '/dashboard/doubts',
        createdBy: isAdmin ? req.user._id : undefined,
      });
    }

    await doubt.populate('userId', 'fullName profilePicture selectedClass');
    res.json({ success: true, data: doubt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Upvote a doubt ──────────────────────────────────
router.put('/:id/upvote', protect, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ success: false, message: 'Not found' });
    const idx = doubt.upvotes.indexOf(req.user._id);
    if (idx === -1) doubt.upvotes.push(req.user._id);
    else doubt.upvotes.splice(idx, 1);
    await doubt.save();
    res.json({ success: true, upvotes: doubt.upvotes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Update status (Admin) ───────────────────────────
router.put('/:id/status', adminOnly, async (req, res) => {
  try {
    const doubt = await Doubt.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: doubt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Delete doubt (Admin or owner) ──────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ success: false, message: 'Not found' });
    if (!doubt.userId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await doubt.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
