const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  type: {
    type: String,
    enum: ['general', 'test', 'holiday', 'assignment', 'result', 'urgent'],
    default: 'general'
  },
  targetClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  isGlobal: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  expiresAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
