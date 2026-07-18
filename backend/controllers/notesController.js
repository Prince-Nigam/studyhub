const Note = require('../models/Note');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const { notifyAll } = require('../utils/notify');

// @desc    Get notes with filters
// @route   GET /api/notes
exports.getNotes = async (req, res) => {
  try {
    const { classId, subjectId, chapterId, type, search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (classId) query.classId = classId;
    if (subjectId) query.subjectId = subjectId;
    if (chapterId) query.chapterId = chapterId;
    if (type) query.type = type;
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const notes = await Note.find(query)
      .populate('chapterId', 'name')
      .populate('subjectId', 'name')
      .populate('classId', 'name grade')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    res.json({
      success: true,
      count: notes.length,
      total,
      pages: Math.ceil(total / limit),
      data: notes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('chapterId', 'name')
      .populate('subjectId', 'name color')
      .populate('classId', 'name grade');

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    // Increment view count
    note.viewCount += 1;
    await note.save({ validateBeforeSave: false });

    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create note (Admin)
// @route   POST /api/notes
exports.createNote = async (req, res) => {
  try {
    const noteData = { ...req.body, uploadedBy: req.user._id };

    // Handle file upload if present
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'study-platform/notes',
          resource_type: 'auto'
        });
        noteData.fileUrl = result.secure_url;
        noteData.filePublicId = result.public_id;
        noteData.type = req.body.type || getFileType(req.file.mimetype);
        // Clean up local file
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        // Fallback to local file path if Cloudinary not configured
        noteData.fileUrl = `/uploads/${req.file.filename}`;
        noteData.type = req.body.type || getFileType(req.file.mimetype);
      }
    }

    const note = await Note.create(noteData);

    // Auto-notify all students
    await notifyAll({
      title: '📄 New Note Added',
      message: `A new note "${note.title}" has been added. Check it out!`,
      type: 'note',
      link: `/dashboard/notes/${note._id}`,
      adminId: req.user._id,
    });

    res.status(201).json({ success: true, data: note, message: 'Note created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update note (Admin)
// @route   PUT /api/notes/:id
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete note (Admin)
// @route   DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    // Delete from Cloudinary if exists
    if (note.filePublicId) {
      await cloudinary.uploader.destroy(note.filePublicId);
    }

    await note.deleteOne();
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function
function getFileType(mimetype) {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.includes('word')) return 'docx';
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'ppt';
  if (mimetype.startsWith('image/')) return 'image';
  return 'pdf';
}
