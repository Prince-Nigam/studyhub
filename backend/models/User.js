const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  profilePicture: {
    type: String,
    default: ''
  },
  selectedClass: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  studyProgress: {
    totalClassesAttended: { type: Number, default: 0 },
    totalNotesRead: { type: Number, default: 0 },
    totalVideosWatched: { type: Number, default: 0 },
    totalLessonsCompleted: { type: Number, default: 0 },
    totalTestsAttempted: { type: Number, default: 0 }
  },
  watchLater: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  bookmarkedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
  downloadHistory: [{
    fileId: { type: mongoose.Schema.Types.ObjectId },
    fileName: String,
    downloadedAt: { type: Date, default: Date.now }
  }],
  testHistory: [{
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    score: Number,
    percentage: Number,
    attemptedAt: { type: Date, default: Date.now }
  }],
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
