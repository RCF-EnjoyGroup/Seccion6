@echo off
title Edtech - Agent + Frontend Launcher
cd /d "%~dp0"

echo ========================================
echo  Starting Edtech Platform
echo ========================================
echo.

echo [1/2] Starting Python Agent (Edy)...
if exist "Edtech-agent\venv\Scripts\python.exe" (
    cd /d "%~dp0Edtech-agent"
    start "Edy Agent" cmd /k "venv\Scripts\python.exe main.py dev"
    cd /d "%~dp0"
) else (
    cd /d "%~dp0Edtech-agent"
    start "Edy Agent" cmd /k "python main.py dev"
    cd /d "%~dp0"
)

echo.
echo [2/2] Starting Next.js Frontend...
cd /d "%~dp0PlatformEdu-ASB"
start "Next.js Frontend" cmd /k "npm run dev"
cd /d "%~dp0"

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
