const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: String, // Rich text content
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
    enum: ['rich-text', 'pdf', 'docx', 'ppt', 'image'],
    default: 'rich-text'
  },
  fileUrl: String,
  filePublicId: String, // Cloudinary public ID
  thumbnailUrl: String,
  tags: [String],
  isDownloadable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, { timestamps: true });

noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Note', noteSchema);
