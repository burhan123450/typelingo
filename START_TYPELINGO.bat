@echo off
title TypeLingo Website Runner
echo ===================================================
echo   Starting TypeLingo (Multilingual Typing Website)
echo ===================================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo [Step 1/2] Installing required packages for the first time...
    echo Please wait 1 to 2 minutes while packages download...
    echo.
    call npm.cmd install
    if errorlevel 1 (
        echo.
        echo ERROR: Package installation failed. Make sure you are connected to the internet.
        pause
        exit /b 1
    )
)

echo.
echo [Step 2/2] Starting the TypeLingo server...
echo Opening http://localhost:3000 in your browser in 4 seconds...
echo (Keep this black window open while using the site!)
echo.

start "" cmd /c "timeout /t 4 >nul & start http://localhost:3000"
call npm.cmd run dev
pause
