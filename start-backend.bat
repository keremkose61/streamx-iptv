@echo off
chcp 65001 >nul
title StreamX IPTV - Backend API (Port 8000)
cd /d "%~dp0backend"

set "PATH=%SystemRoot%\System32;%SystemRoot%\System32\WindowsPowerShell\v1.0;%PATH%"

REM Find PHP
set PHP_BIN=php
where php >nul 2>nul
if %ERRORLEVEL% neq 0 (
    if exist "C:\wamp64\bin\php\php8.3.28\php.exe" (
        set "PHP_BIN=C:\wamp64\bin\php\php8.3.28\php.exe"
    ) else (
        echo [HATA] PHP bulunamadi!
        pause
        exit /b 1
    )
)

echo ==============================================================
echo [StreamX] Backend API sunucusu baslatiliyor...
echo Adres: http://127.0.0.1:8000
echo.
echo NOT: Giris yapabilmek icin WampServer'in (MySQL) acik oldugundan
echo emin olun (sag alt saatin yanindaki W simgesi yesil olmalidir).
echo ==============================================================

"%PHP_BIN%" artisan serve --host=127.0.0.1 --port=8000
pause
