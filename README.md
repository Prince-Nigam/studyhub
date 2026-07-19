# 📚 StudyPlatform — Premium Full Stack Study Platform

A production-ready, full-stack educational platform for Class 1–12 students with notes, videos, MCQ tests, attendance tracking, and an admin panel.

---

## 🚀 Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | Next.js 16 + TypeScript + Tailwind CSS v4 |
| Backend   | Node.js + Express.js |
| Database  | MongoDB (local or Atlas) |
| Auth      | JWT + bcryptjs |
| Animations| Framer Motion |
| Charts    | Recharts |
| Storage   | Cloudinary (optional) |

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local: `mongod` service, or Atlas URI)

### 1. Start Backend
```bash
cd backend
node server.js
# Runs on http://localhost:5000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### 3. One-time Setup (run once)
```bash
# Create admin account
curl -X POST http://localhost:5000/api/auth/admin/setup

# Seed Classes 1-12
curl -X POST http://localhost:5000/api/classes/seed

# Full seed (chapters, notes, videos, tests, announcements)
cd backend
node scripts/fullSeed.js
```

---

## 📁 Project Structure

```
Study Website/
├── backend/
│   ├── controllers/     # Route logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # Express routes
│   ├── middleware/       # Auth middleware
│   ├── config/          # Cloudinary config
│   ├── utils/           # Multer file upload
│   ├── scripts/         # DB seeders
│   └── server.js        # Entry point
│
└── frontend/
    ├── app/
    │   ├── (landing)    # Home page
    │   ├── login/       # Student login
    │   ├── signup/      # Student registration
    │   ├── dashboard/   # Student dashboard
    │   │   ├── classes/         # Class browser
    │   │   ├── notes/           # Notes library
    │   │   ├── videos/          # Video lectures
    │   │   ├── tests/           # MCQ tests
    │   │   ├── attendance/      # Attendance tracker
    │   │   ├── results/         # Test results
    │   │   ├── downloads/       # Download center
    │   │   ├── notifications/   # Notifications
    │   │   ├── profile/         # User profile
    │   │   └── settings/        # App settings
    │   └── admin/       # Admin panel
    │       ├── dashboard/
    │       ├── classes/
    │       ├── subjects/
    │       ├── chapters/
    │       ├── notes/
    │       ├── videos/
    │       ├── tests/
    │       ├── attendance/
    │       ├── users/
    │       ├── announcements/
    │       └── notifications/
    ├── components/      # Reusable UI components
    ├── context/         # React context (Auth, Theme)
    └── services/        # Axios API client
```

---

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register`   — Student signup
- `POST /api/auth/login`      — Student login
- `GET  /api/auth/me`         — Get current user

### Classes / Subjects / Chapters
- `GET  /api/classes`
- `GET  /api/subjects?classId=`
- `GET  /api/chapters?subjectId=`

### Notes
- `GET  /api/notes?classId=&subjectId=&type=&search=`
  
### Videos
- `GET  /api/videos?subjectId=`

### Tests
- `GET  /api/tests?subjectId=&isPublished=true`
- `POST /api/tests/:id/submit`
- `GET  /api/tests/:id/leaderboard`

### Attendance
- `GET  /api/attendance/my`
- `POST /api/attendance/bulk`

### Search
- `GET  /api/search?q=keyword`

---

## 🎨 Features

- ✅ Beautiful glassmorphism dark/light UI
- ✅ Class 1–12 with all subjects and chapters
- ✅ Rich-text and PDF notes with download
- ✅ YouTube embedded video lectures
- ✅ Timed MCQ tests with auto-evaluation
- ✅ Test leaderboard and performance charts
- ✅ Monthly attendance calendar
- ✅ Global search (notes, videos, tests)
- ✅ Admin panel with full CRUD
- ✅ JWT auth with protected routes
- ✅ Mobile-responsive design
- ✅ Dark/light mode toggle
- ✅ Real-time notifications
- ✅ Student progress tracking
