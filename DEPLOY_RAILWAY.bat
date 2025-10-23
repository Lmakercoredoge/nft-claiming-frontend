@echo off
echo ======================================
echo Railway 배포 준비
echo ======================================
echo.

cd E:\nft_claiming

echo 1. package-lock.json 삭제중...
del package-lock.json

echo 2. node_modules 삭제중...
rmdir /s /q node_modules

echo 3. npm install (legacy-peer-deps)...
npm install --legacy-peer-deps

echo 4. Git 커밋...
git add .
git commit -m "Fix dependencies for Railway"

echo 5. Railway 배포...
railway up

echo.
echo ======================================
echo 완료!
echo ======================================
pause
