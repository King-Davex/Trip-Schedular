@echo off
echo ========================================
echo Market Trip Scheduler - Add GitHub Remote
echo ========================================
echo.

set /p username="Enter your GitHub username: "
echo.

echo Adding GitHub remote...
git remote add origin https://github.com/%username%/market-trip-scheduler.git
if %errorlevel% neq 0 (
    echo ERROR: Failed to add remote
    echo This might mean the remote already exists
    echo Try: git remote set-url origin https://github.com/%username%/market-trip-scheduler.git
    pause
    exit /b 1
)
echo SUCCESS: Remote added
echo.

echo Pushing to GitHub...
git push -u origin main
if %errorlevel% neq 0 (
    echo ERROR: Push failed
    echo.
    echo Common solutions:
    echo 1. Make sure you created the repository on GitHub
    echo 2. Check your GitHub credentials
    echo 3. Try: git push -u origin main --force
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Your code is now on GitHub!
echo ========================================
echo.
echo View your repository at:
echo https://github.com/%username%/market-trip-scheduler
echo.
echo Next: Deploy to Vercel
echo 1. Go to https://vercel.com
echo 2. Click "New Project"
echo 3. Import your GitHub repository
echo 4. Click "Deploy"
echo.
pause
