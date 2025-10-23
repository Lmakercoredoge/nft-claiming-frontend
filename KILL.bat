@echo off
echo Killing all Node processes...
taskkill /IM node.exe /F 2>nul
taskkill /IM npm.exe /F 2>nul
echo Done!
timeout /t 2 >nul
