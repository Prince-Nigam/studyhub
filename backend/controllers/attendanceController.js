const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Get attendance for a user
// @route   GET /api/attendance/my
exports.getMyAttendance = async (req, res) => {
  try {
    const { subjectId, month, year } = req.query;
    const query = { userId: req.user._id };

    if (subjectId) query.subjectId = subjectId;

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('subjectId', 'name color')
      .sort({ date: -1 });

    const totalClasses = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    const lateCount = attendance.filter(a => a.status === 'late').length;
    const percentage = totalClasses > 0 ? ((presentCount + lateCount) / totalClasses * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: attendance,
      stats: { totalClasses, presentCount, absentCount, lateCount, percentage: parseFloat(percentage) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark attendance (Admin)
// @route   POST /api/attendance/mark
exports.markAttendance = async (req, res) => {
  try {
    const { userId, subjectId, classId, date, status } = req.body;

    const attendance = await Attendance.findOneAndUpdate(
      { userId, subjectId, date: new Date(date) },
      { userId, subjectId, classId, date: new Date(date), status, markedBy: req.user._id },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ success: true, data: attendance, message: 'Attendance marked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk mark attendance (Admin)
// @route   POST /api/attendance/bulk
exports.bulkMarkAttendance = async (req, res) => {
  try {
    const { subjectId, classId, date, records } = req.body;
    // records: [{ userId, status }]

    const operations = records.map(record => ({
      updateOne: {
        filter: { userId: record.userId, subjectId, date: new Date(date) },
        update: { userId: record.userId, subjectId, classId, date: new Date(date), status: record.status, markedBy: req.user._id },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(operations);
    res.json({ success: true, message: `Attendance marked for ${records.length} students` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance report (Admin)
// @route   GET /api/attendance/report
exports.getAttendanceReport = async (req, res) => {
  try {
    const { classId, subjectId, userId, startDate, endDate } = req.query;
    const query = {};

    if (classId) query.classId = classId;
    if (subjectId) query.subjectId = subjectId;
    if (userId) query.userId = userId;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'fullName email')
      .populate('subjectId', 'name')
      .sort({ date: -1 });

    res.json({ success: true, count: attendance.length, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
