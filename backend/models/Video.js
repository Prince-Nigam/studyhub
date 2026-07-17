const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: String,
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  type: {
    type: String,
    enum: ['youtube', 'recorded', 'playlist'],
    default: 'youtube'
  },
  youtubeUrl: String,
  youtubeId: String, // Extracted YouTube video ID
  videoUrl: String, // For recorded/uploaded videos
  thumbnailUrl: String,
  duration: String, // e.g., "45:30"
  durationSeconds: Number,
  playlistItems: [{
    title: String,
    youtubeId: String,
    duration: String
  }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, { timestamps: true });

videoSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Video', videoSchema);
