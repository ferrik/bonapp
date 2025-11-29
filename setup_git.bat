@echo off
echo ==========================================
echo   FerrikBot Admin Panel - Git Setup
echo ==========================================
echo.

:: Перевірка наявності Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH.
    echo Please install Git from https://git-scm.com/downloads
    echo and restart this script.
    pause
    exit /b
)

echo [1/4] Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo Failed to initialize git.
    pause
    exit /b
)

echo.
echo [2/4] Adding files...
git add .

echo.
echo [3/4] Committing files...
git commit -m "Initial commit: FerrikBot Admin Panel"

echo.
echo [4/4] Connecting to GitHub...
set /p REPO_URL="Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): "

if "%REPO_URL%"=="" (
    echo No URL provided. Exiting.
    pause
    exit /b
)

git branch -M main
git remote add origin %REPO_URL%
git push -u origin main

echo.
echo ==========================================
echo   Done! Project pushed to GitHub.
echo ==========================================
pause
