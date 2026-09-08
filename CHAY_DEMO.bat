@echo off
title Fitness Battle - Demo MVP
color 0A

echo.
echo  ====================================
echo    FITNESS BATTLE - Demo MVP
echo  ====================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [LOI] Chua cai Node.js!
    echo.
    echo  Vui long tai Node.js tai: https://nodejs.org
    echo  Tai ban LTS, cai dat, sau do chay lai file nay.
    echo.
    pause
    exit /b 1
)

:: Check Node version
for /f "delims=" %%i in ('node -v') do set NODE_VER=%%i
echo  [OK] Node.js %NODE_VER% da duoc cai dat
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo  [!] Dang cai dat thu vien...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo  [LOI] Loi khi cai thu vien. Thu lai hoac lien he nguoi phu trah ky thuat.
        echo.
        pause
        exit /b 1
    )
    echo.
)

:: Start dev server with Mobile Host access
echo  [OK] Khoi dong server (Ho tro ca May Tinh & Dien Thoai Mobile)...
echo.
echo  - Tren May tinh: Truy cap http://localhost:5173/
echo  - Tren Dien thoai (cung mang Wi-Fi): Truy cap dia chi IP Network duoc hien thi ben duoi
echo.
echo  Dong server: Nhan Ctrl+C trong cua so nay de tat
echo.
npm run dev -- --host

pause
