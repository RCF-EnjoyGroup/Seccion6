@echo off
title Edtech - Agent + Frontend Launcher
cd /d "%~dp0"

echo ========================================
echo  Starting Edtech Platform
echo ========================================
echo.

echo [1/2] Starting Python Agent (Edy)...
start "Edy Agent" cmd /k "
    cd /d "%~dp0Edtech-agent"
    echo Starting agent...
    if exist venv\Scripts\python.exe (venv\Scripts\python.exe main.py dev) else (python main.py dev)
"

echo.
echo [2/2] Starting Next.js Frontend...
start "Next.js Frontend" cmd /k "
    cd /d "%~dp0PlatformEdu-ASB"
    npm run dev
"

echo.
echo ========================================
echo  Both services starting...
echo ========================================
echo.
echo Next.js:     http://localhost:3000
echo Agent Edy:   http://localhost:3000/agente-edy
echo.
echo Press any key to close this launcher window
echo (services will keep running in their own windows)
pause