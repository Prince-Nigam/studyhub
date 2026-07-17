const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    unique: true,
    trim: true
  },
  description: String,
  grade: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  thumbnail: String,
  isActive: { type: Boolean, default: true },
  totalStudents: { type: Number, default: 0 },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
