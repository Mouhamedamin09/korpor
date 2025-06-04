#!/bin/bash

echo "Starting Real Estate AI Chatbot Server..."
echo

cd "monorep-ai-main/chatbot"

echo "Checking if .env file exists..."
if [ ! -f ".env" ]; then
    echo "ERROR: .env file not found!"
    echo "Please copy env_example.txt to .env and add your API keys."
    echo
    exit 1
fi

echo "Starting Python server on port 5000..."
echo "Press Ctrl+C to stop the server"
echo

python chatbot.py 