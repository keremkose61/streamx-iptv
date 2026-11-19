@echo off
title StreamX IPTV - Development Launcher
cd /d "%~dp0"

echo ==============================================================
echo [StreamX] StreamX IPTV Gelistirme Ortami Baslatiliyor...
echo ==============================================================
echo.
echo 1. Backend API (Laravel 11) yeni pencerede aciliyor...
start "StreamX Backend API" cmd /c "start-backend.bat"

echo 2. Web Arayuzu (React 18 + Vite) yeni pencerede aciliyor...
start "StreamX Web Client" cmd /c "start-web.bat"

echo.
echo ==============================================================
echo Servisler baslatildi!
echo - Backend API:  http://127.0.0.1:8000
echo - Web Arayuzu: http://localhost:5173
echo ==============================================================
echo Bu baslatici penceresini kapatabilirsiniz.
