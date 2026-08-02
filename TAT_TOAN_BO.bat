@echo off
title SAH-TECH - Shutdown
color 0C
echo ============================================
echo    SAH-TECH - TAT TOAN BO HE THONG
echo ============================================
echo.
echo Dang tat tat ca cac tien trinh lien quan...
echo.

taskkill /F /FI "WINDOWTITLE eq SAH-TECH Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq SAH-TECH User Interface*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq SAH-TECH Dashboard*" >nul 2>&1

echo.
echo [OK] Da tat toan bo he thong.
echo.
timeout /t 3 /nobreak >nul

