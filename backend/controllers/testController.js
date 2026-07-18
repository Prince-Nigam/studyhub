const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const { notifyAll } = require('../utils/notify');

// @desc    Get all tests
// @route   GET /api/tests
exports.getTests = async (req, res) => {
  try {
    const { classId, subjectId, chapterId, isPublished } = req.query;
    const query = { isActive: true };

    if (classId) query.classId = classId;
    if (subjectId) query.subjectId = subjectId;
    if (chapterId) query.chapterId = chapterId;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    const tests = await Test.find(query)
      .populate('chapterId', 'name')
      .populate('subjectId', 'name')
      .populate('classId', 'name grade')
      .select('-questions.options.isCorrect') // Don't expose correct answers in list
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tests.length, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single test (with questions, no correct answers)
// @route   GET /api/tests/:id
exports.getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('chapterId', 'name')
      .populate('subjectId', 'name color')
      .populate('classId', 'name grade');

    if (!test || !test.isPublished) {
      return res.status(404).json({ success: false, message: 'Test not found or not published' });
    }

    // Remove correct answer indicators for students
    const testObj = test.toObject();
    testObj.questions = testObj.questions.map(q => ({
      ...q,
      options: q.options.map(opt => ({ text: opt.text, _id: opt._id }))
    }));

    res.json({ success: true, data: testObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit test
// @route   POST /api/tests/:id/submit
exports.submitTest = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const test = await Test.findById(req.params.id);

    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let skipped = 0;

    const evaluatedAnswers = test.questions.map((question, index) => {
      const userAnswer = answers.find(a => a.questionId.toString() === question._id.toString());
      
      if (!userAnswer || userAnswer.selectedOption === undefined || userAnswer.selectedOption === null) {
        skipped++;
        return { questionId: question._id, selectedOption: null, isCorrect: false, marksAwarded: 0 };
      }

      const selectedOpt = question.options[userAnswer.selectedOption];
      const isCorrect = selectedOpt && selectedOpt.isCorrect;
      const marksAwarded = isCorrect ? (question.marks || 1) : 0;

      if (isCorrect) { score += marksAwarded; correctAnswers++; }
      else wrongAnswers++;

      return {
        questionId: question._id,
        selectedOption: userAnswer.selectedOption,
        isCorrect,
        marksAwarded
      };
    });

    const percentage = (score / test.totalMarks) * 100;
    const passed = score >= test.passingMarks;

    const result = await TestResult.create({
      userId: req.user._id,
      testId: test._id,
      answers: evaluatedAnswers,
      score,
      totalMarks: test.totalMarks,
      percentage: parseFloat(percentage.toFixed(2)),
      correctAnswers,
      wrongAnswers,
      skipped,
      timeTaken,
      passed
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'studyProgress.totalTestsAttempted': 1 },
      $push: {
        testHistory: {
          testId: test._id,
          score,
          percentage: parseFloat(percentage.toFixed(2))
        }
      }
    });

    test.attempts += 1;
    await test.save({ validateBeforeSave: false });

    // Return with correct answers for review
    const detailedQuestions = test.questions.map((q, i) => ({
      ...q.toObject(),
      userAnswer: evaluatedAnswers[i].selectedOption,
      isCorrect: evaluatedAnswers[i].isCorrect
    }));

    res.json({
      success: true,
      message: passed ? '🎉 Congratulations! You passed!' : 'Keep practicing! You can do better!',
      result: {
        ...result.toObject(),
        questions: detailedQuestions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leaderboard for a test
// @route   GET /api/tests/:id/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const results = await TestResult.find({ testId: req.params.id })
      .populate('userId', 'fullName profilePicture')
      .sort({ score: -1, timeTaken: 1 })
      .limit(20);

    const leaderboard = results.map((r, index) => ({
      rank: index + 1,
      user: r.userId,
      score: r.score,
      percentage: r.percentage,
      timeTaken: r.timeTaken,
      passed: r.passed
    }));

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create test (Admin)
// @route   POST /api/tests
exports.createTest = async (req, res) => {
  try {
    const test = await Test.create({ ...req.body, createdBy: req.user._id });

    // Auto-notify if published
    if (test.isPublished) {
      await notifyAll({
        title: '🧠 New MCQ Test Live!',
        message: `New test "${test.title}" is now available. Attempt it now!`,
        type: 'test',
        link: `/dashboard/tests/${test._id}`,
        adminId: req.user._id,
      });
    }

    res.status(201).json({ success: true, data: test, message: 'Test created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update test (Admin)
// @route   PUT /api/tests/:id
exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete test (Admin)
// @route   DELETE /api/tests/:id
exports.deleteTest = async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
