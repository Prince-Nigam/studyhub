@echo off
title StudyPlatform - Database Setup
color 0E
echo ============================================
echo   StudyPlatform - One-time DB Setup
echo ============================================
cd /d "%~dp0backend"

echo [1/3] Creating Admin account...
curl -s -X POST http://localhost:5000/api/auth/admin/setup -H "Content-Type: application/json" -d "{}"
echo.

echo [2/3] Seeding Classes 1-12...
curl -s -X POST http://localhost:5000/api/classes/seed -H "Content-Type: application/json" -d "{}"
echo.

echo [3/3] Running full seed (chapters, notes, videos, tests)...
node scripts/fullSeed.js

echo.
echo ============================================
echo   Setup Complete!
echo   Admin: admin@studyplatform.com / Admin@123
echo   Open: http://localhost:3000
echo ============================================
pause
