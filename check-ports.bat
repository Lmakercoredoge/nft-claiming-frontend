@echo off
echo ========================================
echo 🔍 Checking Port Usage
echo ========================================
echo.

echo [Checking Port 3000]
netstat -ano | findstr :3000
if errorlevel 1 (
    echo ✅ Port 3000 is FREE
) else (
    echo ❌ Port 3000 is IN USE
)
echo.

echo [Checking Port 3001]
netstat -ano | findstr :3001
if errorlevel 1 (
    echo ✅ Port 3001 is FREE
) else (
    echo ❌ Port 3001 is IN USE
)
echo.

echo [Checking Port 5173]
netstat -ano | findstr :5173
if errorlevel 1 (
    echo ✅ Port 5173 is FREE
) else (
    echo ❌ Port 5173 is IN USE
)
echo.

echo ========================================
echo 📝 Current Configuration:
echo ========================================
echo Backend: PORT 3001 (from .env)
echo Frontend: PORT 5173 (Vite default)
echo API URL: http://localhost:3001
echo ========================================
pause
