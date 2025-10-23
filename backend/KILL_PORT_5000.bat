@echo off
echo ===================================
echo  포트 5000 점유 프로세스 종료
echo ===================================
echo.

echo 포트 5000 사용 중인 프로세스 찾는 중...
netstat -ano | findstr :5000

echo.
echo 프로세스 종료 중...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo PID %%a 종료 시도...
    taskkill /PID %%a /F
)

echo.
echo ===================================
echo  완료!
echo ===================================
pause
