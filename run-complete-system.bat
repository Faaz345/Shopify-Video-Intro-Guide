@echo off
echo ============================================
echo     SHOPIFY GUIDE COMPLETE SYSTEM STARTUP
echo ============================================
echo.

:: Kill any existing Node processes on our ports
echo [1/3] Cleaning up existing processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Payment Server*" 2>nul
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Protected Guide*" 2>nul
timeout /t 2 /nobreak >nul

:: Start Payment Server (Port 5000/3000)
echo [2/3] Starting Payment Server...
start "Payment Server - Port 5000" cmd /k "cd /d %~dp0 && node server-shopify.js"
timeout /t 3 /nobreak >nul

:: Start Protected Guide Server (Port 3006)
echo [3/3] Starting Protected Guide Server...
start "Protected Guide - Port 3006" cmd /k "cd /d %~dp0video-intro-guide-shopify && node protected-guide-server.js"
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo     SYSTEM STARTUP COMPLETE!
echo ============================================
echo.
echo SERVERS RUNNING:
echo ----------------
echo [Payment Gateway]    http://localhost:5000
echo [Protected Guide]    http://localhost:3006
echo.
echo HOW IT WORKS:
echo -------------
echo 1. Customer visits: http://localhost:5000
echo 2. Makes payment via Razorpay
echo 3. Receives email with secure link
echo 4. Link format: http://localhost:3006/access?token=JWT_TOKEN
echo 5. Customer clicks link to access guide
echo.
echo SECURITY FEATURES:
echo ------------------
echo - JWT Authentication Required
echo - 30-day token expiry
echo - HTTP-only secure cookies
echo - Protected HTML content
echo.
echo Press any key to open the payment page in browser...
pause >nul

:: Open payment page in default browser
start http://localhost:5000

echo.
echo System is running. Press Ctrl+C in each window to stop servers.
echo.
pause
