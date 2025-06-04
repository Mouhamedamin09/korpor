import requests
import json

# Test the exact request that React Native is making
url = "http://localhost:5002/api/chat"
payload = {
    "query": "Hello",
    "voice_enabled": False
}

print("🧪 Testing exact React Native request...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(
        url,
        headers={'Content-Type': 'application/json'},
        json=payload,  # Using json parameter instead of data
        timeout=10
    )
    
    print(f"\n📊 Response Status: {response.status_code}")
    print(f"📊 Response Headers: {dict(response.headers)}")
    print(f"📊 Raw Response Text: {response.text}")
    
    if response.status_code == 200:
        try:
            json_response = response.json()
            print(f"\n✅ JSON Response: {json.dumps(json_response, indent=2)}")
            print(f"✅ Response field: '{json_response.get('response', 'NOT FOUND')}'")
        except Exception as e:
            print(f"❌ JSON parsing error: {e}")
    else:
        print(f"❌ Non-200 status code: {response.status_code}")
        
except Exception as e:
    print(f"❌ Request error: {e}") 