@echo off
title StreamX IPTV - Web Client (Vite)
cd /d "%~dp0apps\web"

echo ==============================================================
echo [StreamX] Web arayuzu baslatiliyor...
echo Adres: http://localhost:5173
echo ==============================================================
npm run dev
pause
