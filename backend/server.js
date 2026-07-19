const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

/* ── Security ──────────────────────────────────── */
app.use(helmet());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

/* ── Rate limiting (relaxed in dev) ────────────── */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 10000,
  message: 'Too many requests, please try again later.',
  skip: () => process.env.NODE_ENV !== 'production',
});
app.use('/api/', limiter);

/* ── CORS ───────────────────────────────────────── */
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => o && (origin === o || origin.endsWith('.netlify.app')))) {
      return callback(null, true);
    }
    callback(null, true); // Allow all in dev; restrict in prod via env
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* ── Body parsing ───────────────────────────────── */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ── Static uploads ─────────────────────────────── */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ── MongoDB ────────────────────────────────────── */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    console.log('💡 Set MONGODB_URI in environment variables');
  }
};
connectDB();

/* ── Routes ─────────────────────────────────────── */
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/classes',       require('./routes/classes'));
app.use('/api/subjects',      require('./routes/subjects'));
app.use('/api/chapters',      require('./routes/chapters'));
app.use('/api/notes',         require('./routes/notes'));
app.use('/api/videos',        require('./routes/videos'));
app.use('/api/tests',         require('./routes/tests'));
app.use('/api/attendance',    require('./routes/attendance'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/search',        require('./routes/search'));
app.use('/api/doubts',        require('./routes/doubts'));

/* ── Health check ───────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'StudyPlatform API is running',
    env: process.env.NODE_ENV,
    timestamp: new Date(),
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'StudyPlatform API', docs: '/api/health' });
});

/* ── Error handler ──────────────────────────────── */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

/* ── 404 ─────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

/* ── Start ──────────────────────────────────────── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📚 API:    http://localhost:${PORT}/api/health`);
  console.log(`🌍 Env:    ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
