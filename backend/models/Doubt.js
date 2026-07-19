const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'replies.repliedByModel' },
  repliedByModel: { type: String, enum: ['User', 'Admin'], default: 'User' },
  repliedByName: String,
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const doubtSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: String,
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
  replies: [replySchema],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Doubt', doubtSchema);
