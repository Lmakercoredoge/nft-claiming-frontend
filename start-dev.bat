@echo off
echo ========================================
echo   NFT Claiming App - Development Mode
echo ========================================
echo.
echo Starting backend server...
start "Backend Server" cmd /k "node server.js"
timeout /t 3 /nobreak >nul
echo.
echo Starting frontend dev server...
start "Frontend Dev Server" cmd /k "npm run dev:frontend"
echo.
echo ========================================
echo   Servers are starting...
echo   Backend: http://localhost:3000
echo   Frontend: http://localhost:5173
echo ========================================
