@echo off
chcp 65001 >nul
title StreamX IPTV - Backend API (Port 8000)
cd /d "%~dp0backend"

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
echo [StreamX] Backend API sunucusu baslatildi.
echo Adres: http://127.0.0.1:8000
echo ==============================================================
"%PHP_BIN%" artisan serve --host=127.0.0.1 --port=8000
pause
