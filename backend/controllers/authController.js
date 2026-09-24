const crypto = require('crypto');
const twilio = require('twilio');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/auth');

const normalizeEmail = (email) =>
  typeof email === 'string' ? email.trim().toLowerCase() : email;

// ── Twilio client (lazy — only created when needed) ────────────────────────
const getTwilioClient = () =>
  twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ── Generate a 6-digit OTP ─────────────────────────────────────────────────
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── Hash OTP before storing (sha256) ──────────────────────────────────────
const hashOTP = (otp) =>
  crypto.createHash('sha256').update(otp).digest('hex');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { fullName, mobile, password } = req.body;
    const email = normalizeEmail(req.body.email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ fullName, email, mobile, password });
    const token = generateToken(user._id, 'student');

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Study Platform.',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profilePicture: user.profilePicture,
        selectedClass: user.selectedClass,
        studyProgress: user.studyProgress,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Contact support.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, 'student');

    res.json({
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profilePicture: user.profilePicture,
        selectedClass: user.selectedClass,
        studyProgress: user.studyProgress,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = generateToken(admin._id, 'admin');

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: 'admin',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchLater', 'title thumbnailUrl duration')
      .populate('bookmarkedNotes', 'title type');

    if (!user) {
      const admin = await Admin.findById(req.user._id);
      return res.json({ success: true, user: admin });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create initial admin (run once)
// @route   POST /api/auth/admin/setup
// @access  Public
exports.setupAdmin = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const {
      fullName = 'Admin',
      email = 'admin@studyplatform.com',
      password = 'Admin@123',
    } = req.body || {};

    const admin = await Admin.create({ fullName, email, password });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      credentials: { email: admin.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  FORGOT PASSWORD — OTP via SMS
// ═══════════════════════════════════════════════════════════════════════════

// @desc    Send OTP to student's registered mobile number
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^[0-9]{10}$/.test(mobile.trim())) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide a valid 10-digit mobile number' });
    }

    const user = await User.findOne({ mobile: mobile.trim() });

    // Generic response — don't reveal if number exists
    if (!user) {
      return res.json({
        success: true,
        message: 'If this number is registered, an OTP has been sent.',
      });
    }

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ success: false, message: 'Your account has been blocked. Contact support.' });
    }

    // Rate-limit: block if a valid OTP was sent in the last 60 seconds
    if (user.resetPasswordExpire && user.resetPasswordExpire > Date.now() + 9 * 60 * 1000) {
      return res.status(429).json({
        success: false,
        message: 'OTP already sent. Please wait 60 seconds before requesting again.',
      });
    }

    const otp = generateOTP();
    user.resetPasswordToken = hashOTP(otp);
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send SMS via Twilio
    try {
      const client = getTwilioClient();
      await client.messages.create({
        body: `Your StudyHub OTP is: ${otp}\nValid for 10 minutes. Do not share with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${mobile.trim()}`,   // India (+91) — change prefix if needed
      });
    } catch (smsError) {
      // Roll back if SMS fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error('Twilio SMS error:', smsError.message);
      return res
        .status(500)
        .json({ success: false, message: 'Failed to send OTP. Please try again.' });
    }

    res.json({ success: true, message: 'OTP sent to your registered mobile number.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP (does NOT reset password yet — just validates)
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
    }

    const user = await User.findOne({
      mobile: mobile.trim(),
      resetPasswordToken: hashOTP(otp.trim()),
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired OTP. Please try again.' });
    }

    // OTP is valid — issue a short-lived reset session token so the
    // frontend can call reset-password without re-sending the OTP
    const resetSessionToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetSessionToken)
      .digest('hex');
    // Keep the same expiry — user has the remaining time to set new password
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'OTP verified successfully.',
      resetToken: resetSessionToken,   // sent to frontend, used in next step
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { mobile, resetToken, password } = req.body;

    if (!mobile || !resetToken || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Mobile, reset token, and new password are required' });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken.trim())
      .digest('hex');

    const user = await User.findOne({
      mobile: mobile.trim(),
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Session expired. Please request a new OTP.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const jwtToken = generateToken(user._id, 'student');

    res.json({
      success: true,
      message: 'Password reset successful! You are now logged in.',
      token: jwtToken,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profilePicture: user.profilePicture,
        selectedClass: user.selectedClass,
        studyProgress: user.studyProgress,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
