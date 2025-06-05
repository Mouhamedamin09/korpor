import requests
import json
import time

def test_chatbot():
    base_url = "http://localhost:5002"
    
    print("🧪 Testing Chatbot API...")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1️⃣ Testing Health Endpoint...")
    try:
        response = requests.get(f"{base_url}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed!")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test 2: Chat with greeting
    print("\n2️⃣ Testing Chat with Greeting...")
    try:
        payload = {"query": "Hello", "voice_enabled": False}
        response = requests.post(
            f"{base_url}/api/chat", 
            headers={'Content-Type': 'application/json'},
            data=json.dumps(payload),
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            print("✅ Chat test 1 passed!")
            print(f"   Query: {payload['query']}")
            print(f"   Response: {result.get('response', 'No response')[:100]}...")
        else:
            print(f"❌ Chat test 1 failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ Chat test 1 error: {e}")
    
    # Test 3: Chat about real estate
    print("\n3️⃣ Testing Chat about Real Estate...")
    try:
        payload = {"query": "What are the legal requirements for real estate investment in Tunisia?", "voice_enabled": False}
        response = requests.post(
            f"{base_url}/api/chat", 
            headers={'Content-Type': 'application/json'},
            data=json.dumps(payload),
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            print("✅ Chat test 2 passed!")
            print(f"   Query: {payload['query'][:50]}...")
            print(f"   Response: {result.get('response', 'No response')[:100]}...")
        else:
            print(f"❌ Chat test 2 failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ Chat test 2 error: {e}")
    
    print("\n🎉 API Testing Complete!")
    print("📱 Now you can test the React Native app!")

if __name__ == "__main__":
    test_chatbot() 