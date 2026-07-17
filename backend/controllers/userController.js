const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Get all users (Admin)
// @route   GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, isBlocked } = req.query;
    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true';

    const skip = (page - 1) * limit;
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await User.countDocuments(query);

    res.json({ success: true, count: users.length, total, pages: Math.ceil(total / limit), data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user (Admin)
// @route   GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, mobile, selectedClass } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (mobile) updateData.mobile = mobile;
    if (selectedClass) updateData.selectedClass = selectedClass;

    // Handle profile picture upload
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'study-platform/profiles',
          width: 300,
          height: 300,
          crop: 'fill'
        });
        updateData.profilePicture = result.secure_url;
        fs.unlinkSync(req.file.path);
      } catch {
        updateData.profilePicture = `/uploads/${req.file.filename}`;
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
    res.json({ success: true, data: user, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block/Unblock user (Admin)
// @route   PUT /api/users/:id/block
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully',
      isBlocked: user.isBlocked
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats for user
// @route   GET /api/users/dashboard-stats
exports.getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const Attendance = require('../models/Attendance');
    const TestResult = require('../models/TestResult');

    const [attendanceData, testResults] = await Promise.all([
      Attendance.find({ userId: req.user._id }),
      TestResult.find({ userId: req.user._id }).populate('testId', 'title')
    ]);

    const presentCount = attendanceData.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendancePercentage = attendanceData.length > 0
      ? parseFloat((presentCount / attendanceData.length * 100).toFixed(1))
      : 0;

    const avgTestScore = testResults.length > 0
      ? parseFloat((testResults.reduce((sum, r) => sum + r.percentage, 0) / testResults.length).toFixed(1))
      : 0;

    res.json({
      success: true,
      data: {
        studyProgress: user.studyProgress,
        attendancePercentage,
        totalAttendance: attendanceData.length,
        testResults: testResults.slice(-5).reverse(),
        avgTestScore
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
