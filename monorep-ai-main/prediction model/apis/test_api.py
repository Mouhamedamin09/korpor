import requests
import copy

#API endpoint
API_URL = "http://127.0.0.1:5000/predict" 

# Sample valid test case based on dataset
apartment_buying = {
            "total_area": 118,
            "rooms": 3,
            "bathrooms": 1,
            "terrace": 1,
            "furnished":0 ,
            "air_conditioning": 0,
            "heating": 0,
            "security": 0,
            "floor": 1,
            "latitude":  36.8556,
            "longitude": 10.2918,
            "bedrooms": 2,
            "garage": 1,
            "garden": 0,
            "pool": 0,
            'model_name': 'apartment_buying',
            'city':'Gammarth',
            'governorate':'Tunis'
            }
# Sample valid test case based on dataset 
house_buying = {
            "total_area": 450,
            "rooms": 5,
            "bathrooms": 5,
            "terrace": 0,
            "furnished":0 ,
            "air_conditioning": 0,
            "heating": 0,
            "security": 0,
            "latitude":  36.8764,
            "longitude": 10.3253,
            "bedrooms": 2,
            "garage": 1,
            "garden": 0,
            "pool": 0,
            'model_name': 'house_buying',
            'city':'gammarth',
            'governorate':'Ariana'
            }
apartment_renting = {
    'total_area':70,
    'rooms':3,
    'terrace':1,
    'elevator':0,
    'furnished':1,
    'air_conditioning':1,
    'heating':1,
    'security':1,
    'floor_number':1,
    'latitude':35.8569,
    'longitude':10.5972,
    'bedrooms':2,
    'garage':0,
    'garden':0,
    'pool':0,
    'bathrooms_number':1,
    'payment_period_Mois':True,
    'payment_period_Semaine':False,
    'city':"Sousse",
    'governorate':"Sousse",
    "model_name":"apartment_rent"}
house_renting = {
    'total_area':350,
    'rooms':4,
    'terrace':1,
    'furnished':1,
    'air_conditioning':1,
    'heating':1,
    'security':0,
    'latitude':36.4011,
    'longitude':10.6146,
    'bedrooms':2,
    'garage':0,
    'garden':1,
    'pool':0,
    'bathrooms_number':1,
    'payment_period_Mois':True,
    'payment_period_Semaine':False,
    'city':"Sousse",
    'governorate':"Sousse",
    "model_name":"house_rent"}

tests=[apartment_buying,house_buying,apartment_renting,house_renting]

ch=["test apartment buying","test house buying","test apartment renting",'test house renting']

#Correct test cases
print("Valide tests: ")
for i in range(4):
    print(ch[i])
    response = requests.post(API_URL, json=tests[i])
    print(response.json(),"staut code: ",response.status_code)

#Correct test cases but with a city that we don't have a data about => half model
print("Valide tests without city: ")
for i in range(4):
    print(ch[i])
    tests[i]['city']="Berline"
    response = requests.post(API_URL, json=tests[i])
    print(response.json(),"staut code: ",response.status_code)
#not sending a json file data
print("\n No json file")
response = requests.post(API_URL)
print(response.json(),"staut code: ",response.status_code)
#Model name does not exist
print("Invalid model name")
apartment_buying['model_name']="apartment_buying_invalid"
response = requests.post(API_URL, json=apartment_buying)
print(response.json(),"staut code: ",response.status_code)
apartment_buying['model_name']="apartment_buying"

#missing parameter
print("\n Missing parameter")
test_copies = [copy.deepcopy(test) for test in tests] #deepcopy creates a completely independant clone
for i in range(4):
    print(ch[i])
    del test_copies[i]['rooms']
    response = requests.post(API_URL, json=test_copies[i])
    print(response.json(),"staut code: ",response.status_code)

#Invalid city and governorate
print("\n Invalid city and governorate")
test_copies = [copy.deepcopy(test) for test in tests] #deepcopy creates a completely independant clone
for i in range(4):
    print(ch[i])
    test_copies[i]['city']="Los anglos"
    test_copies[i]['governorate']="America"
    response = requests.post(API_URL, json=test_copies[i])
    print(response.json(),"staut code: ",response.status_code)

#Wrong variable type
print("\n Wrong variable type")
test_copies = [copy.deepcopy(test) for test in tests] #deepcopy creates a completely independant clone
for i in range(4):
    print(ch[i])
    test_copies[i]['garage']="hello"
    response = requests.post(API_URL, json=test_copies[i])
    print(response.json(),"staut code: ",response.status_code)
