const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');

// @desc    Get all classes
// @route   GET /api/classes
exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true }).sort('grade');
    res.json({ success: true, count: classes.length, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
exports.getClass = async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) return res.status(404).json({ success: false, message: 'Class not found' });
    
    const subjects = await Subject.find({ classId: req.params.id, isActive: true }).sort('order');
    res.json({ success: true, data: { ...classDoc.toObject(), subjects } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create class (Admin)
// @route   POST /api/classes
exports.createClass = async (req, res) => {
  try {
    const classDoc = await Class.create(req.body);
    res.status(201).json({ success: true, data: classDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update class (Admin)
// @route   PUT /api/classes/:id
exports.updateClass = async (req, res) => {
  try {
    const classDoc = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!classDoc) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: classDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete class (Admin)
// @route   DELETE /api/classes/:id
exports.deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seed default classes 1-12
// @route   POST /api/classes/seed
exports.seedClasses = async (req, res) => {
  try {
    const count = await Class.countDocuments();
    if (count > 0) return res.json({ success: true, message: 'Classes already seeded' });

    const classes = [];
    for (let i = 1; i <= 12; i++) {
      classes.push({ name: `Class ${i}`, grade: i, description: `Curriculum for Class ${i}`, order: i });
    }
    await Class.insertMany(classes);
    res.status(201).json({ success: true, message: '12 classes created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
