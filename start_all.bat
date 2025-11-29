@echo off
echo ==========================================
echo   FerrikBot Admin Panel - Start Script
echo ==========================================
echo.
cd /d "%~dp0"

echo [1/2] Starting Convex Backend...
start "Convex Backend" powershell -ExecutionPolicy Bypass -Command "npx convex dev"

echo.
echo Waiting 5 seconds for Convex to start...
timeout /t 5 >nul

echo.
echo [2/2] Starting React Frontend...
echo.
echo Once started, open: http://localhost:5173
echo.
powershell -ExecutionPolicy Bypass -Command "npm run dev"

pause
