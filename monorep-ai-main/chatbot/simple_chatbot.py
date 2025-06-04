from flask import Flask, request, jsonify
from flask_cors import CORS
import time

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React Native to connect

def simple_ai_response(query):
    """
    Simple hardcoded responses for testing
    """
    query_lower = query.lower()
    
    if "hello" in query_lower or "hi" in query_lower or "bonjour" in query_lower:
        return "Hello! I'm your AI assistant for real-estate investments in Tunisia. How can I help you today?"
    
    elif "real estate" in query_lower or "property" in query_lower or "investment" in query_lower:
        return "In Tunisia, real estate investment is regulated by specific laws. Key considerations include: 1) Foreign ownership restrictions in certain areas, 2) Property registration requirements, 3) Tax implications for investors, 4) Market trends in major cities like Tunis and Sousse."
    
    elif "tunisia" in query_lower or "tunisian" in query_lower:
        return "Tunisia offers attractive real estate opportunities, especially in tourist areas. The government has specific regulations for foreign investors, and it's important to work with licensed local agents and legal professionals."
    
    elif "legal" in query_lower or "law" in query_lower or "regulation" in query_lower:
        return "Tunisian real estate law requires: 1) Proper documentation and registration, 2) Compliance with foreign ownership regulations, 3) Tax declaration for property transactions, 4) Working with certified notaries for legal transfers."
    
    elif "price" in query_lower or "cost" in query_lower or "expensive" in query_lower:
        return "Real estate prices in Tunisia vary significantly by location. Coastal areas and major cities tend to be more expensive. It's advisable to research current market rates and consider factors like infrastructure, accessibility, and future development plans."
    
    else:
        return f"Thank you for your question about '{query}'. While I specialize in Tunisian real estate, I can tell you that this is an important topic that requires proper research and consultation with local experts. Would you like to know more about real estate investment opportunities in Tunisia?"

# API endpoint
@app.route('/api/chat', methods=['POST'])  
def chat_endpoint():
    try:
        data = request.json
        if not data or 'query' not in data:
            return jsonify({"error": "No query provided"}), 400
        
        query = data['query']
        voice_enabled = data.get("voice_enabled", False)
        
        print(f"📝 Received query: {query}")
        print(f"🔊 Voice enabled: {voice_enabled}")
        
        # Simulate some processing time
        time.sleep(1)
        
        # Get AI response
        response_text = simple_ai_response(query)
        
        print(f"✅ Generated response: {response_text[:100]}...")
        
        return jsonify({"response": response_text}), 200
        
    except Exception as e:
        print(f"❌ Error in chat endpoint: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok", 
        "message": "Simple Chatbot API is running",
        "timestamp": time.time()
    })

# Root endpoint
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "message": "Simple Chatbot API", 
        "endpoints": ["/api/health", "/api/chat"],
        "status": "running"
    })

if __name__ == "__main__":
    print("🚀 Starting Simple Chatbot API on port 5002...")
    print("📋 Available endpoints:")
    print("   GET  / - API info")
    print("   GET  /api/health - Health check") 
    print("   POST /api/chat - Chat with AI")
    print("\n🔗 Test the API:")
    print("   curl http://localhost:5002/api/health")
    print("   curl -X POST http://localhost:5002/api/chat -H 'Content-Type: application/json' -d '{\"query\":\"Hello\", \"voice_enabled\":false}'")
    print("\n⏹️  Press Ctrl+C to stop")
    
    app.run(host='0.0.0.0', port=5002, debug=True) 