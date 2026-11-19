@echo off
REM ==============================================================================
REM StreamX IPTV - Smart TV (Samsung Tizen & LG webOS) Automated Build Script
REM ==============================================================================

setlocal enabledelayedexpansion

echo [StreamX] Starting Smart TV build process...

set ROOT_DIR=%~dp0..
cd /d "%ROOT_DIR%"

REM 1. Validate Samsung Tizen Assets
echo.
echo [StreamX] 1/4 Validating Samsung Tizen assets...
node apps/samsung-tv/scripts/build.js
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Samsung Tizen asset validation failed!
    exit /b %ERRORLEVEL%
)

REM 2. Validate LG webOS Assets
echo.
echo [StreamX] 2/4 Validating LG webOS assets...
node apps/lg-tv/scripts/build.js
if %ERRORLEVEL% neq 0 (
    echo [ERROR] LG webOS asset validation failed!
    exit /b %ERRORLEVEL%
)

REM 3. Package Samsung Tizen WGT if Tizen CLI is available
echo.
echo [StreamX] 3/4 Checking Tizen CLI for .wgt packaging...
where tizen >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [StreamX] Tizen CLI detected. Building StreamX001.wgt...
    tizen package -t wgt -s DefaultSecurityProfile -- ./apps/samsung-tv/www
) else (
    echo [StreamX] Tizen CLI not found in PATH.
    echo [StreamX] To build .wgt on your machine, install Tizen Studio and run:
    echo            tizen package -t wgt -s <SecurityProfile> -- ./apps/samsung-tv/www
)

REM 4. Package LG webOS IPK if webOS CLI is available
echo.
echo [StreamX] 4/4 Checking webOS CLI for .ipk packaging...
where ares-package >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [StreamX] webOS CLI (ares-package) detected. Building IPK package...
    ares-package ./apps/lg-tv/www -o ./apps/lg-tv/dist
) else (
    echo [StreamX] webOS CLI (ares-package) not found in PATH.
    echo [StreamX] To build .ipk on your machine, install webOS TV CLI and run:
    echo            ares-package ./apps/lg-tv/www -o ./apps/lg-tv/dist
)

echo.
echo ==============================================================================
echo [StreamX] Smart TV build validation completed successfully!
echo - Samsung Tizen: apps/samsung-tv/www (Ready for WGT packaging or Tizen Studio)
echo - LG webOS:     apps/lg-tv/www      (Ready for IPK packaging or webOS Simulator)
echo ==============================================================================

exit /b 0
