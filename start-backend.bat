@echo off
title StudyPlatform - Backend Server
color 0A
echo ============================================
echo   StudyPlatform Backend Server
echo   http://localhost:5000
echo ============================================
cd /d "%~dp0backend"
node server.js
pause
