@echo off

start "Vite/NPM Dev Server" npm run dev
timeout /t 5 /nobreak >nul
start "Python Main Script" python main.py
timeout /t 6 /nobreak >nul
start "Python Stomper Script" python stompServer.py
timeout /t 6 /nobreak >nul
start "Python Static Features Script" python assist\featureAndSoil.py
timeout /t 6 /nobreak >nul
pause
