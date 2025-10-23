@echo off
chcp 65001 >nul
cls
echo ╔════════════════════════════════════════╗
echo ║     🔍 PORT & PROCESS CHECKER         ║
echo ╚════════════════════════════════════════╝
echo.

echo [1] Checking Port 3000...
netstat -ano | findstr :3000
if errorlevel 1 (echo ✅ Port 3000 is FREE) else (echo ❌ Port 3000 is IN USE)
echo.

echo [2] Checking Port 3001...
netstat -ano | findstr :3001
if errorlevel 1 (echo ✅ Port 3001 is FREE) else (echo ❌ Port 3001 is IN USE)
echo.

echo [3] Checking Port 5173...
netstat -ano | findstr :5173
if errorlevel 1 (echo ✅ Port 5173 is FREE) else (echo ❌ Port 5173 is IN USE)
echo.

echo [4] All Node.js Processes:
tasklist | findstr node.exe
echo.

echo ═══════════════════════════════════════
echo 💡 To kill a process: taskkill /PID [number] /F
echo 💡 To kill all node: taskkill /IM node.exe /F
echo ═══════════════════════════════════════
pause
