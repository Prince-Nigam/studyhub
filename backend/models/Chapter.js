const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chapter name is required'],
    trim: true
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
  description: String,
  chapterNumber: Number,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Chapter', chapterSchema);
