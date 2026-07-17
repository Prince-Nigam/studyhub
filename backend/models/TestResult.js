const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    selectedOption: Number, // index of chosen option
    isCorrect: Boolean,
    marksAwarded: Number
  }],
  score: Number,
  totalMarks: Number,
  percentage: Number,
  correctAnswers: Number,
  wrongAnswers: Number,
  skipped: Number,
  timeTaken: Number, // in seconds
  passed: Boolean,
  rank: Number,
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('TestResult', testResultSchema);
