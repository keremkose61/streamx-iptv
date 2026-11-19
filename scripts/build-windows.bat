@echo off
echo ====================================================
echo StreamX IPTV - Windows Masaustu Paketi Uretici
echo ====================================================

echo [1/3] Web Arayuzu Derleniyor...
cd apps\web
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Hata: Web derlemesi basarisiz oldu.
    exit /b %ERRORLEVEL%
)
cd ..\..

echo [2/3] Masaustu Bagimliliklari Kontrol Ediliyor...
cd apps\desktop
if not exist node_modules (
    call npm install
)

echo [3/3] Tauri Windows Paketi Uretiliyor (NSIS / MSI)...
call npx tauri build
if %ERRORLEVEL% NEQ 0 (
    echo Bilgi: Rust/Tauri ortami tespit edilemediyse yerel Webview2 modu kullanilabilir.
)

cd ..\..
echo ====================================================
echo Islem Tamamlandi.
echo ====================================================
