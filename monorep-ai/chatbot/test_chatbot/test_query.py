import requests
import json

# API endpoint
url = "http://localhost:5000/api/chat"

questions=["la copropriété en tunisie",
          "ما هي المتطلبات القانونية للتطوير العقاري في تونس",
          "The Challenges That Real Estate Developers In Tunisia Face",
          "Is donland Trump a good president ?"]
file_name=["frensh.txt","arabic.txt","english.txt","irrelevant.txt"]
payload = {
            "query": questions[1],
            "voice_enabled": False
        }

# Send POST request
headers = {'Content-Type': 'application/json'}
response = requests.post(url, headers=headers, data=json.dumps(payload))
# Print response
print("Status Code:", response.status_code)
result=response.text
result = result.encode().decode('unicode-escape')
with open(file_name[1], "w", encoding="utf-8") as file:
    file.write(result)

