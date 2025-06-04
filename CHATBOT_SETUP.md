# AI Chatbot Setup Guide

This guide will help you set up and run the Real Estate AI Chatbot with the React Native frontend.

## 🚀 Quick Start

### Step 1: Set up the Python Backend

1. **Navigate to the chatbot directory**:

   ```bash
   cd monorep-ai-main/chatbot
   ```

2. **Install Python dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:

   - Copy `env_example.txt` to `.env`
   - Edit `.env` and add your API keys:
     ```
     google_api_key=your_actual_google_api_key
     ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key
     ```

4. **Start the server**:
   - **Windows**: Double-click `start_chatbot.bat` or run:
     ```cmd
     start_chatbot.bat
     ```
   - **Mac/Linux**: Run:
     ```bash
     ./start_chatbot.sh
     ```
   - **Manual**:
     ```bash
     python chatbot.py
     ```

### Step 2: Set up the React Native Frontend

1. **Navigate to the frontend directory**:

   ```bash
   cd front-mobile
   ```

2. **Install dependencies** (if not already done):

   ```bash
   npm install
   ```

3. **Start the Expo development server**:

   ```bash
   npm start
   ```

4. **Run on device/emulator**:
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code for physical device

## 📋 Prerequisites

### Required API Keys

1. **Google Gemini API Key**:

   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

2. **ElevenLabs API Key** (for voice features):
   - Go to [ElevenLabs Dashboard](https://elevenlabs.io/docs/api-reference/authentication)
   - Create an account and get your API key
   - Add it to your `.env` file

### Software Requirements

- **Python 3.8+**
- **Node.js 16+**
- **Expo CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development on Mac)

## 🔧 Troubleshooting

### Backend Issues

1. **"Module not found" errors**:

   ```bash
   pip install -r requirements.txt
   ```

2. **API key errors**:

   - Check your `.env` file exists
   - Verify API keys are valid and properly formatted

3. **Port already in use**:
   - Kill any process using port 5000
   - Or modify the port in `chatbot.py`

### Frontend Issues

1. **"Cannot connect to API"**:

   - Ensure Python backend is running on port 5000
   - Check console logs for detailed error messages
   - Verify network connectivity

2. **Android emulator connection issues**:

   - Make sure you're using `10.0.2.2:5000` for Android emulator
   - Check if the emulator can access the internet

3. **iOS simulator connection issues**:
   - Make sure you're using `localhost:5000` for iOS simulator
   - Check firewall settings

## 🌍 Supported Languages

The chatbot automatically detects and responds in:

- **English** 🇺🇸
- **French** 🇫🇷
- **Arabic** 🇸🇦

## 📱 Features

- ✅ Multilingual real estate Q&A
- ✅ Smart response caching
- ✅ Typing indicators
- ✅ Beautiful chat UI
- ✅ Connection status monitoring
- ✅ Voice generation (with ElevenLabs API)
- ✅ Suggested prompts
- ✅ Error handling

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/JSON    ┌──────────────────┐
│                 │  ───────────►   │                  │
│ React Native    │                 │ Python Flask     │
│ Frontend        │                 │ Backend          │
│ (Port varies)   │  ◄───────────   │ (Port 5000)      │
└─────────────────┘                 └──────────────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ Google Gemini    │
                                    │ + Vector DB      │
                                    │ + ElevenLabs     │
                                    └──────────────────┘
```

## 📝 Testing

To test the backend API directly:

```bash
cd monorep-ai-main/chatbot
python test_chat_endpoint.py
```

## 🎯 Next Steps

1. **Start the backend server** using the startup scripts
2. **Launch the React Native app** with Expo
3. **Test the connection** - you should see a green "Connected" status
4. **Ask questions** about Tunisian real estate in any supported language

Enjoy your AI-powered real estate assistant! 🏠🤖
