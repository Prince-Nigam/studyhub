const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/auth');

// ── Email transporter (uses env vars) ──────────────────────────────────────
const createTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const normalizeEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : email;

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { fullName, mobile, password } = req.body;
    const email = normalizeEmail(req.body.email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
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
        studyProgress: user.studyProgress
      }
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
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login
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
        studyProgress: user.studyProgress
      }
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
        role: 'admin'
      }
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
// @access  Public (should be disabled after setup)
exports.setupAdmin = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const {
      fullName = 'Admin',
      email = 'admin@studyplatform.com',
      password = 'Admin@123'
    } = req.body || {};

    const admin = await Admin.create({ fullName, email, password });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      credentials: { email: admin.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists — send generic success
      return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    }

    // Generate a random token and hash it before storing
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"StudyHub" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Reset Your StudyHub Password',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#07081A;color:#f1f5f9;padding:32px;border-radius:16px;">
            <h2 style="color:#a78bfa;margin-bottom:8px;">Password Reset Request</h2>
            <p style="color:#94a3b8;margin-bottom:24px;">Hi ${user.fullName}, we received a request to reset your password.</p>
            <a href="${resetUrl}"
               style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
              Reset Password
            </a>
            <p style="color:#64748b;font-size:13px;margin-top:24px;">This link expires in <strong style="color:#f1f5f9;">15 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,.08);margin:24px 0;" />
            <p style="color:#475569;font-size:12px;">Or paste this link in your browser:<br/><span style="color:#a78bfa;">${resetUrl}</span></p>
          </div>
        `,
      });

      return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    } catch (emailError) {
      // Roll back token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error('Email error:', emailError);
      return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Hash the incoming raw token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
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
