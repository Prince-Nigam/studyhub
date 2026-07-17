const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  explanation: String,
  marks: { type: Number, default: 1 },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
});

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Test title is required'],
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
  questions: [questionSchema],
  totalQuestions: Number,
  totalMarks: Number,
  timeLimit: { type: Number, default: 30 }, // in minutes
  passingMarks: Number,
  isPublished: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  attempts: { type: Number, default: 0 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, { timestamps: true });

// Auto-calculate totals
testSchema.pre('save', function () {
  if (this.questions && this.questions.length > 0) {
    this.totalQuestions = this.questions.length;
    this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    if (!this.passingMarks) {
      this.passingMarks = Math.ceil(this.totalMarks * 0.4);
    }
  }
});

module.exports = mongoose.model('Test', testSchema);
