@echo off
chcp 65001 >nul
title StreamX IPTV - Smart TV Arayüzü Simülatörü
cd /d "%~dp0"

echo ==============================================================
echo [StreamX] Akıllı TV 10-Foot Arayüzü Başlatılıyor...
echo ==============================================================
echo Kumanda Tuşları Simülasyonu:
echo - Yön Tuşları (▲ ▼ ◀ ▶): Kumanda D-Pad Gezinme
echo - ENTER / OK: Kanal Seçme ve Oynatma
echo - ESC / Backspace: TV Geri Tuşu (Tam Ekran / Çıkış)
echo - Sayı Tuşları (0-9): Direkt Kanal Numarası (CH 1, CH 2...)
echo ==============================================================

start "" "apps\samsung-tv\www\index.html"
