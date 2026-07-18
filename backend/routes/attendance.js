const express = require('express');
const router = express.Router();
const { getMyAttendance, markAttendance, bulkMarkAttendance, getAttendanceReport, selfMark, getTodayStatus } = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/my', protect, getMyAttendance);
router.get('/today', protect, getTodayStatus);
router.post('/self-mark', protect, selfMark);
router.get('/report', adminOnly, getAttendanceReport);
router.post('/mark', adminOnly, markAttendance);
router.post('/bulk', adminOnly, bulkMarkAttendance);

module.exports = router;
