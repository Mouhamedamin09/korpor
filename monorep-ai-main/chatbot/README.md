# Real Estate AI Chatbot

A multilingual AI chatbot specialized in Tunisian real estate that supports English, French, and Arabic.

## Features

- 🤖 AI-powered responses using Google Gemini 2.0 Flash
- 🌍 Multilingual support (English, French, Arabic)
- 🔊 Text-to-speech voice generation using ElevenLabs
- 📚 RAG (Retrieval Augmented Generation) using vector embeddings
- 💾 Response caching for faster replies
- 🏠 Specialized in Tunisian real estate knowledge

## Setup

### 1. Install Python Dependencies

```bash
cd monorep-ai-main/chatbot
pip install -r requirements.txt
```

### 2. Configure Environment Variables

1. Copy the example environment file:

   ```bash
   cp env_example.txt .env
   ```

2. Edit `.env` and add your API keys:
   ```
   google_api_key=your_actual_google_api_key
   ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key
   ```

### 3. Get API Keys

- **Google API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **ElevenLabs API Key**: Get from [ElevenLabs Dashboard](https://elevenlabs.io/docs/api-reference/authentication)

### 4. Start the Server

```bash
python chatbot.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check

```
GET /api/health
```

### Send Message

```
POST /api/chat
Content-Type: application/json

{
  "query": "Your question here",
  "voice_enabled": false
}
```

## Usage with React Native

The React Native frontend is already configured to connect to this backend. Make sure:

1. The Python server is running on port 5000
2. Your environment variables are properly set
3. For Android emulator, the app uses `10.0.2.2:5000`
4. For iOS simulator, the app uses `localhost:5000`

## Data Files

The chatbot uses pre-processed data in JSON format:

- `data_en.json` - English real estate data
- `data_fr.json` - French real estate data
- `data_ar.json` - Arabic real estate data

Vector embeddings are stored in:

- `chroma_db_en/` - English embeddings
- `chroma_db_fr/` - French embeddings
- `chroma_db_ar/` - Arabic embeddings

## Troubleshooting

1. **Connection Issues**: Make sure the server is running and accessible
2. **API Key Errors**: Verify your `.env` file has valid API keys
3. **Language Detection**: The bot auto-detects language but defaults to English
4. **Vector Store**: First run may take longer as it builds the vector embeddings

## Development

To test the API directly:

```bash
python test_chat_endpoint.py
```
