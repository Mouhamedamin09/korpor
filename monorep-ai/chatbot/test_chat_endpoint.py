import requests
import json

# API endpoint
url = "http://localhost:5002/api/chat"

# Test query
payload = {
    "query": "co ownership in tunisia",
    "voice_enabled": False
}

# Send POST request
headers = {'Content-Type': 'application/json'}
response = requests.post(url, headers=headers, data=json.dumps(payload))

# Print response
print("Status Code:", response.status_code)
print("Response Headers:", dict(response.headers))
print("Raw Response Text:", response.text)

# Try to parse JSON response
try:
    json_response = response.json()
    print("\nJSON Response:")
    print(json.dumps(json_response, indent=4))
except json.JSONDecodeError as e:
    print(f"\nError decoding JSON: {e}")
    print("Response content:", response.content)