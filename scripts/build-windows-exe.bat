@echo off
chcp 65001 >nul
title StreamX IPTV - Windows Exe Build Script
cd /d "%~dp0.."

echo ==============================================================
echo [StreamX] Windows Standalone .exe Derleniyor...
echo ==============================================================

echo 1. Web arayüzü derleniyor...
call npm run build --workspace=@streamx/web

echo 2. .NET 10 ile Windows tek parça (.exe) derleniyor...
dotnet publish apps/desktop-windows/StreamX.Desktop.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:EnableCompressionInSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o apps/desktop-windows/bin/Release-Standalone

if %ERRORLEVEL% equ 0 (
    echo.
    echo ==============================================================
    echo [BASARILI] StreamX-IPTV.exe basariyla olusturuldu!
    echo Konum: apps\desktop-windows\bin\Release-Standalone\StreamX-IPTV.exe
    echo ==============================================================
) else (
    echo [HATA] Derleme basarisiz oldu.
)

pause
