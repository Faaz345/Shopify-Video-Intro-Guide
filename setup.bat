@echo off
echo ===============================================
echo    Secure Razorpay Payment Gateway Setup
echo ===============================================
echo.

echo [1/4] Installing dependencies...
npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Creating environment file...
if not exist .env (
    copy .env.example .env
    echo Environment file created! Please edit .env with your credentials.
) else (
    echo Environment file already exists.
)

echo.
echo [3/4] Checking MongoDB connection...
echo Make sure MongoDB is running on your system.
echo If you don't have MongoDB installed, you can:
echo - Install locally: https://docs.mongodb.com/manual/installation/
echo - Use MongoDB Atlas: https://cloud.mongodb.com/

echo.
echo [4/4] Setup complete!
echo.
echo ===============================================
echo                 NEXT STEPS:
echo ===============================================
echo.
echo 1. Edit .env file with your Razorpay credentials:
echo    - Get keys from: https://dashboard.razorpay.com/app/keys
echo    - Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
echo.
echo 2. Set up MongoDB:
echo    - Local: Start mongod service
echo    - Cloud: Update MONGODB_URI in .env
echo.
echo 3. Generate JWT Secret:
echo    - Set a secure JWT_SECRET in .env
echo.
echo 4. Start the development server:
echo    npm run dev
echo.
echo 5. Test the payment page:
echo    Open: http://localhost:5000/payment.html
echo.
echo ===============================================
echo.
pause
