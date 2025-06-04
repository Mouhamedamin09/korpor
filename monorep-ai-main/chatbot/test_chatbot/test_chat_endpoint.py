import requests
import json

# API endpoint
url = "http://localhost:5000/api/chat"
#different questions
arabic_questions=["ما هي المتطلبات القانونية للتطوير العقاري في تونس",
                "التحديات التي يواجهها مطورو العقارات في تونس",
                "هل ترامب رئيس جيد"]
frensh_questions=["Le Processus D'Obtention De Permis Pour De Nouveaux Projets",
                "Quelles Sont Les Exigences LÉGales Pour Le DÉVeloppement Immobilier En Tunisie ?",
                "est ce que le président Donald Trump est bon"]
english_questions=["What Are The Legal Requirements For Real Estate Development In Tunisia?",
                "The Challenges That Real Estate Developers In Tunisia Face",
                "is Donland Trump a good president"]

counter=1
print("\n \n Arabic Questions: \n")
for question in arabic_questions:
    # Test query
    payload = {
        "query": question,
        "voice_enabled": False
    }

    # Send POST request
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, data=json.dumps(payload))

    # Print response
    print("Status Code:", response.status_code)
    result=response.text
    result = result.encode().decode('unicode-escape')
    file_name=str(counter)+".txt"
    with open(file_name, "w", encoding="utf-8") as file:
        file.write(result)
    if counter==1:
        break
    counter+=1

"""
print("\n \n Frensh Questions: \n")
for question in frensh_questions:
    # Test query
    payload = {
        "query": question,
        "voice_enabled": False
    }

    # Send POST request
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, data=json.dumps(payload))

    # Print response
    print("Status Code:", response.status_code)
    result=response.text
    result = result.encode().decode('unicode-escape')
    file_name=str(counter)+".txt"
    with open(file_name, "w", encoding="utf-8") as file:
        file.write(result.text)
    counter+=1


print("\n \n English Questions: \n")
for question in english_questions:
    # Test query
    payload = {
        "query": question,
        "voice_enabled": False
    }

    # Send POST request
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, data=json.dumps(payload))

    # Print response
    print("Status Code:", response.status_code)
    file_name=str(counter)+".txt"
    with open(file_name, "w", encoding="utf-8") as file:
        file.write(response.text)
    counter+=1
"""