@echo off
chcp 65001 >nul
title StreamX IPTV - Development Launcher
cd /d "%~dp0"

echo ==============================================================
echo [StreamX] StreamX IPTV Gelistirme Ortami Baslatiliyor...
echo ==============================================================
echo.
echo 1. Backend API (Laravel 11) yeni pencerede baslatiliyor...
start "StreamX Backend API (Port 8000)" cmd /k "call start-backend.bat"

echo 2. Web Arayuzu (React 18 + Vite) yeni pencerede baslatiliyor...
start "StreamX Web Client (Port 5173)" cmd /k "call start-web.bat"

echo.
echo ==============================================================
echo Servisler baslatildi!
echo - Web Arayuzu: http://localhost:5173
echo - Backend API: http://127.0.0.1:8000
echo ==============================================================
echo Tarayiciniz otomatik olarak http://localhost:5173 adresini acacaktir.
echo.
echo NOT: WampServer'daki 'odis' projeniz Port 80'dedir (http://localhost).
echo       StreamX IPTV ise Port 5173 (http://localhost:5173) uzerindedir.
echo ==============================================================
