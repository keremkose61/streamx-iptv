@echo off
chcp 65001 >nul
title StreamX IPTV - Web Client (Port 5173)
cd /d "%~dp0apps\web"

echo ==============================================================
echo [StreamX] Web arayuzu baslatiliyor...
echo Adres: http://localhost:5173
echo ==============================================================
npm run dev
pause
