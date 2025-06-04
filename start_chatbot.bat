@echo off
echo Starting Real Estate AI Chatbot Server...
echo.

cd "monorep-ai-main\chatbot"

echo Checking if .env file exists...
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please copy env_example.txt to .env and add your API keys.
    echo.
    pause
    exit /b 1
)

echo Starting Python server on port 5000...
echo Press Ctrl+C to stop the server
echo.

python chatbot.py 