@echo off
title SAH-TECH Drone Logistics - Launcher
color 0A
echo ============================================
echo    SAH-TECH DRONE LOGISTICS - LAUNCHER
echo ============================================
echo.
echo Dang khoi dong toan bo he thong...
echo.

REM Check if port 3001 is in use (backend already running)
netstat -an | findstr ":3001" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Backend da chay san tren port 3001
) else (
    echo [1/3] Dang khoi dong BACKEND (port 3001)...
    start "SAH-TECH Backend" cmd /k "cd /d d:\project\backend && node server.js"
    timeout /t 8 /nobreak >nul
)

REM Check if port 5173 is in use (user frontend)
netstat -an | findstr ":5173" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Giao dien nguoi dung da chay san tren port 5173
) else (
    echo [2/3] Dang khoi dong GIAO DIEN NGUOI DUNG (port 5173)...
    start "SAH-TECH User Interface" cmd /k "cd /d d:\project\Giao dien nguoi dung && npm run dev"
    timeout /t 6 /nobreak >nul
)

REM Check if port 5174 is in use (dashboard frontend)
netstat -an | findstr ":5174" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] SAH Dashboard da chay san tren port 5174
) else (
    echo [3/3] Dang khoi dong SAH DASHBOARD (port 5174)...
    start "SAH-TECH Dashboard" cmd /k "cd /d d:\project\SAH Dashboard && npm run dev"
    timeout /t 6 /nobreak >nul
)

echo.
echo ============================================
echo    HE THONG DA SAN SANG!
echo ============================================
echo.
echo    Backend API:       http://127.0.0.1:3001/api/health
echo    Giao dien nguoi dung:  http://localhost:5173
echo    SAH Dashboard:     http://localhost:5174
echo.
echo    Tai khoan Admin: admin@sah.tech / admin123
echo.
echo ============================================
echo    DONG CUA SO NAY DE TAT MOI THU
echo ============================================
timeout /t 5 /nobreak >nul

