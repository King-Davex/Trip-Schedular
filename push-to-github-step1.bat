@echo off
echo ========================================
echo Market Trip Scheduler - GitHub Push
echo ========================================
echo.

echo Step 1: Adding all files to git...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo SUCCESS: Files added
echo.

echo Step 2: Committing changes...
git commit -m "Complete project setup with Vercel configuration"
if %errorlevel% neq 0 (
    echo WARNING: Commit failed or no changes to commit
    echo This might be okay if everything is already committed
)
echo.

echo Step 3: Renaming branch to main...
git branch -M main
if %errorlevel% neq 0 (
    echo WARNING: Branch rename failed - might already be on main
)
echo.

echo Step 4: Checking if remote exists...
git remote -v
echo.

echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo If you don't see 'origin' above, you need to:
echo 1. Create a repository on GitHub at https://github.com/new
echo 2. Name it: market-trip-scheduler
echo 3. Make it Public
echo 4. DO NOT initialize with README
echo 5. Then run: push-to-github-step2.bat
echo.
echo If you DO see 'origin' above, run:
echo    git push -u origin main
echo.
pause
