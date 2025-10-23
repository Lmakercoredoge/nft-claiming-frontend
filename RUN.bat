@echo off
title MONGMONG - CLEAN START
color 0A

echo.
echo ╔════════════════════════════════════════╗
echo ║   🔥 MONGMONG CLEAN START 🔥          ║
echo ╚════════════════════════════════════════╝
echo.

echo [1/4] Killing all Node processes...
taskkill /IM node.exe /F 2>nul
taskkill /IM npm.exe /F 2>nul
timeout /t 2 >nul
echo ✅ Done
echo.

echo [2/4] Starting Backend (Port 3000)...
start "BACKEND" cmd /k "color 0C && cd /d E:\nft_Claiming && node simple-server.js"
timeout /t 3 >nul
echo ✅ Backend started
echo.

echo [3/4] Starting Frontend (Port 5173)...
start "FRONTEND" cmd /k "color 0B && cd /d E:\nft_Claiming && npm run dev:frontend"
echo ✅ Frontend starting...
echo.

echo [4/4] Opening browser in 5 seconds...
timeout /t 5 >nul
start http://localhost:5173/shop
echo.

echo ╔════════════════════════════════════════╗
echo ║   ✅ ALL SERVERS RUNNING!             ║
echo ╠════════════════════════════════════════╣
echo ║   Backend:  http://localhost:3000     ║
echo ║   Frontend: http://localhost:5173     ║
echo ║   Shop:     http://localhost:5173/shop║
echo ╚════════════════════════════════════════╝
echo.
pause
