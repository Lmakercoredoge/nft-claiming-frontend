@echo off
echo ========================================
echo Testing MONGMONG Backend APIs
echo ========================================
echo.

echo [1/5] Testing Health Endpoint...
curl -s http://localhost:3000/health
echo.
echo.

echo [2/5] Testing Products API...
curl -s http://localhost:3000/api/products
echo.
echo.

echo [3/5] Testing Admin Settings...
curl -s http://localhost:3000/api/admin/settings
echo.
echo.

echo [4/5] Testing Admin Stats...
curl -s http://localhost:3000/api/admin/stats
echo.
echo.

echo [5/5] Testing Whitelist...
curl -s http://localhost:3000/api/admin/whitelist
echo.
echo.

echo ========================================
echo Testing Complete!
echo ========================================
pause
