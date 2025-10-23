@echo off
echo ========================================
echo 🔥 KILLING ALL PROCESSES
echo ========================================
taskkill /IM node.exe /F 2>nul
taskkill /IM npm.exe /F 2>nul
timeout /t 2 >nul

echo.
echo ========================================
echo 🚀 STARTING BACKEND (Port 3000)
echo ========================================
start "BACKEND" cmd /k "cd /d E:\nft_Claiming && set PORT=3000 && node server.js"

timeout /t 3 >nul

echo.
echo ========================================
echo 🎨 STARTING FRONTEND (Port 5173)
echo ========================================
start "FRONTEND" cmd /k "cd /d E:\nft_Claiming && npm run dev:frontend"

echo.
echo ========================================
echo ✅ SERVERS STARTING...
echo ========================================
echo 📡 Backend: http://localhost:3000
echo 🎨 Frontend: http://localhost:5173
echo 🛍️ Shop: http://localhost:5173/shop
echo ========================================
pause
