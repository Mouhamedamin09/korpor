from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from thefuzz import process, fuzz
import pickle
# Initialize Flask app
app = Flask(__name__)
def models_params(model_name):
    if model_name=='apartment_buying':
        return(['total_area', 'rooms', 'bathrooms', 'terrace', 'furnished',
       'air_conditioning', 'heating', 'security', 'floor', 'latitude',
       'longitude', 'bedrooms', 'garage', 'garden', 'pool','model_name','city','governorate'])
    elif model_name=='house_buying':
        return(['total_area', 'rooms', 'bathrooms', 'terrace', 'furnished',
       'air_conditioning', 'heating', 'security', 'latitude', 'longitude',
       'bedrooms', 'garage', 'garden', 'pool','city','governorate'])
    elif model_name=='house_rent':
        return(['total_area', 'rooms', 'terrace', 'furnished', 'air_conditioning',
                'heating', 'security', 'latitude', 'longitude', 'bedrooms', 'garage',
                'garden', 'pool', 'bathrooms_number', 'payment_period_Mois',
                'payment_period_Semaine','city','governorate'])
    else:
        return(['total_area', 'rooms', 'terrace', 'elevator', 'furnished',
       'air_conditioning', 'heating', 'security', 'floor_number', 'latitude',
       'longitude', 'bedrooms', 'garage', 'garden', 'pool', 'bathrooms_number',
       'payment_period_Mois', 'payment_period_Semaine','city','governorate'])

def get_buying_data(csv_name,city,governorate):
        geo_df=pd.read_csv(csv_name)
        result = process.extractOne( city,geo_df["municipality"], scorer=fuzz.ratio, score_cutoff=75)
        municipality = result[0] if result else None
        if municipality:
            categorical_columns = ['municipality_quality', 'municipality_quality_confidence',
                'governorate_quality', 'governorate_quality_confidence']
            geo_df = pd.get_dummies(geo_df, columns=categorical_columns, drop_first=False)
            data_geo=geo_df[geo_df['municipality']==municipality]
            data_geo=data_geo.drop(columns=['municipality','governorate'],axis=1)
            return data_geo
        else:
            result = process.extractOne( governorate,geo_df["governorate"], scorer=fuzz.ratio, score_cutoff=75)
            governorate = result[0] if result else None
            if governorate:
                geo_df=geo_df[['governorate','governorate_avg_price','governorate_quality','governorate_quality_confidence']]
                geo_df = pd.get_dummies(geo_df, columns=['governorate_quality','governorate_quality_confidence'], drop_first=False)
                data_geo=geo_df[geo_df['governorate']==governorate].head(1)
                data_geo=data_geo.drop(columns=['governorate'],axis=1)
                return data_geo
            else:
                return None
def get_renting_data(csv_name,city,governorate):
        geo_df=pd.read_csv(csv_name)
        result = process.extractOne( city,geo_df["municipality"], scorer=fuzz.ratio, score_cutoff=75)
        municipality = result[0] if result else None
        if municipality:
            categorical_columns = ['municipality_quality', 'municipality_quality_confidence',
                'governorate_quality']
            geo_df = pd.get_dummies(geo_df, columns=categorical_columns, drop_first=False)
            data_geo=geo_df[geo_df['municipality']==municipality]
            data_geo=data_geo[['municipality_quality_mid_price_housing_area',
                                'municipality_quality_premium_housing_area',
                                'municipality_quality_confidence_low',
                                'governorate_quality_mid_price_housing_area',
                                'governorate_quality_premium_housing_area']]
            return data_geo
        else:
            result = process.extractOne( governorate,geo_df["governorate"], scorer=fuzz.ratio,
                                         score_cutoff=75)
            governorate = result[0] if result else None
            if governorate:
                geo_df=geo_df[['governorate','governorate_avg_price','governorate_quality',
                                'governorate_quality_confidence']]
                geo_df = pd.get_dummies(geo_df, columns=['governorate_quality'], drop_first=False)
                data_geo=geo_df[geo_df['governorate']==governorate].head(1)
                data_geo=data_geo[[ 'governorate_quality_mid_price_housing_area',
                                    'governorate_quality_premium_housing_area']]
                return data_geo
            else:
                return None
           

def find_city_data(city,governorate,model_name):
    if model_name=='apartment_buying':
        data_geo=get_buying_data('municipality_governorate_description_22.csv',city,governorate)
    elif model_name=='house_buying':
        data_geo=get_buying_data('municipality_governorate_description_24.csv',city,governorate)
    else:
        data_geo=get_renting_data('municipality_governorate_description.csv',city,governorate)

    return data_geo
def load_model(model_path):
    try:
        with open(model_path, 'rb') as file:
            model = pickle.load(file)
        return model
    except FileNotFoundError:
        print(f"Model file not found: {model_path}")
        return None
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        return None

def predict_apartment_buying(data, city_gov_data):
    try:
        # convert all parameters from JSON
        processed_data = {
            "total_area": float(data["total_area"]),
            "rooms": float(data["rooms"]),
            "bathrooms": float(data["bathrooms"]),
            "terrace": int(data["terrace"]),
            "furnished": int(data["furnished"]),
            "air_conditioning": int(data["air_conditioning"]),
            "heating": int(data["heating"]),
            "security": int(data["security"]),
            "floor": int(data["floor"]),
            "latitude": float(data["latitude"]),
            "longitude": float(data["longitude"]),
            "bedrooms": float(data["bedrooms"]),
            "garage": int(data["garage"]),
            "garden": int(data["garden"]),
            "pool": int(data["pool"])
        }
    except:
        return jsonify({"error": "Data type error"}), 400
    try:
        # create DataFrame with a list to indicate it's a single row
        df = pd.DataFrame([processed_data])    
        # merge the DataFrames
        city_gov_data = city_gov_data.reset_index(drop=True)
        merged_df = pd.concat([df, city_gov_data], axis=1)
        
        if city_gov_data.shape[1] == 6: #half_fmodel
            model = load_model('apartment_buying_half.pkl')
        else:
            model = load_model('apartment_buying_full.pkl')
        if model is None:
            return {"error": "Failed to load model"}, 500
            
        prediction = model.predict(merged_df)
        # Convert numpy array to Python native type for JSON serialization
        return jsonify({"prediction": prediction.tolist() if isinstance(prediction, np.ndarray) else prediction}), 200
    except:
        return jsonify({"error": "Undefined error"}), 500

def predict_house_buying(data, city_gov_data):
    try:
        # Convert all parameters from JSON
        processed_data = {
            "total_area": float(data["total_area"]),
            "rooms": float(data["rooms"]),
            "bathrooms": float(data["bathrooms"]),
            "terrace": int(data["terrace"]),
            "furnished": int(data["furnished"]),
            "air_conditioning": int(data["air_conditioning"]),
            "heating": int(data["heating"]),
            "security": int(data["security"]),
            "latitude": float(data["latitude"]),
            "longitude": float(data["longitude"]),
            "bedrooms": float(data["bedrooms"]),
            "garage": int(data["garage"]),
            "garden": int(data["garden"]),
            "pool": int(data["pool"])
        }
    except:
        return jsonify({"error": "Data type error"}), 400
    try:
        # Create DataFrame with a list to indicate it's a single row
        df = pd.DataFrame([processed_data])    
        # Merge the DataFrames
        city_gov_data = city_gov_data.reset_index(drop=True)
        merged_df = pd.concat([df, city_gov_data], axis=1)
        
        if city_gov_data.shape[1] == 6: #half_fmodel
            model = load_model('house_buying_half.pkl')   
        else:
            model = load_model('house_buying_full.pkl')
        
        if model is None:
            return {"error": "Failed to load model"}, 500
        prediction = model.predict(merged_df)
        # Convert numpy array to Python native type for JSON serialization
        return jsonify({"prediction": prediction.tolist() if isinstance(prediction, np.ndarray) else prediction}), 200
    except:
        return jsonify({"error": "Undefined error"}), 500
        
def predict_apartment_renting(data, city_gov_data):
    try:
        # Convert all parameters from JSON
        processed_data = {
            "total_area": float(data["total_area"]),
            "rooms": float(data["rooms"]),
            "terrace": int(data["terrace"]),
            "elevator": int(data["elevator"]),
            "furnished": int(data["furnished"]),
            "air_conditioning": int(data["air_conditioning"]),
            "heating": int(data["heating"]),
            "security": int(data["security"]),
            "floor_number": int(data["floor_number"]),
            "latitude": float(data["latitude"]),
            "longitude": float(data["longitude"]),
            "bedrooms": float(data["bedrooms"]),
            "garage": int(data["garage"]),
            "garden": int(data["garden"]),
            "pool": int(data["pool"]),
            "bathrooms_number": int(data["bathrooms_number"]),
            "payment_period_Mois": int(data["payment_period_Mois"]),
            "payment_period_Semaine": int(data["payment_period_Semaine"])
        }
    except:
        return jsonify({"error": "Data type error"}), 400
    try:
        # Create DataFrame with a list to indicate it's a single row
        df = pd.DataFrame([processed_data])    
        # Merge the DataFrames
        city_gov_data = city_gov_data.reset_index(drop=True)
        merged_df = pd.concat([df, city_gov_data], axis=1)
        
        if city_gov_data.shape[1] == 2: #half_fmodel
            model = load_model('apartement_renting_half.pkl')
        else:
            model = load_model('apartement_renting_full.pkl')
        
        if model is None:
            return {"error": "Failed to load model"}, 500
        prediction = model.predict(merged_df)
        # Convert numpy array to Python native type for JSON serialization
        return jsonify({"prediction": prediction.tolist() if isinstance(prediction, np.ndarray) else prediction}), 200
    except:
        return jsonify({"error": "Undefined error"}), 500
def predict_house_renting(data, city_gov_data):
    try:
        # Convert all parameters from JSON
        processed_data = {
            "total_area": float(data["total_area"]),
            "rooms": float(data["rooms"]),
            "terrace": int(data["terrace"]),
            "furnished": int(data["furnished"]),
            "air_conditioning": int(data["air_conditioning"]),
            "heating": int(data["heating"]),
            "security": int(data["security"]),
            "latitude": float(data["latitude"]),
            "longitude": float(data["longitude"]),
            "bedrooms": float(data["bedrooms"]),
            "garage": int(data["garage"]),
            "garden": int(data["garden"]),
            "pool": int(data["pool"]),
            "bathrooms_number": int(data["bathrooms_number"]),
            "payment_period_Mois": int(data["payment_period_Mois"]),
            "payment_period_Semaine": int(data["payment_period_Semaine"])
        }
    except:
        return jsonify({"error": "Data type error"}), 400
    try:
        # Create DataFrame with a list to indicate it's a single row
        df = pd.DataFrame([processed_data])    
        # Merge the DataFrames
        city_gov_data = city_gov_data.reset_index(drop=True)
        merged_df = pd.concat([df, city_gov_data], axis=1)
        
        if city_gov_data.shape[1] == 2: #half_fmodel
            model = load_model('house_renting_half.pkl')
        else:
            model = load_model('house_renting_full.pkl')
        
        if model is None:
            return {"error": "Failed to load model"}, 500
        prediction = model.predict(merged_df)
        # Convert numpy array to Python native type for JSON serialization
        return jsonify({"prediction": prediction.tolist() if isinstance(prediction, np.ndarray) else prediction}), 200
    except:
        return jsonify({"error": "Undefined error"}), 500
@app.route('/predict', methods=['POST'])
def predict():
    # Ensure request is JSON
    if request.content_type != 'application/json':
        return jsonify({'error': 'Content-Type must be application/json'}), 415
    # Extract JSON data 
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data received'}), 400

    model_name=data['model_name']
    if model_name not in ['apartment_buying','apartment_rent','house_buying','house_rent']:
        return jsonify({'error': 'Invalid model name'}), 400

    required_params=models_params(model_name)
    missing = [param for param in required_params if param not in data] #missing is a list
    if missing:
        # .join converts the list to a comma-seperated string 
        return jsonify({'error': 'Missing parameters: ' + ', '.join(missing)}), 400
    city = data["city"]
    governorate = data["governorate"]
    city_gov_data=find_city_data(city,governorate,model_name)
    if city_gov_data is None:
        return jsonify({'error': 'Invalid city and governorate'}), 400
    try:
        if model_name=='apartment_buying':
            prediction=predict_apartment_buying(data,city_gov_data)
        elif model_name=='house_buying':
            prediction=predict_house_buying(data,city_gov_data)
        elif model_name=='apartment_rent':
            prediction=predict_apartment_renting(data,city_gov_data)
        elif model_name=="house_rent":
            prediction=predict_house_renting(data,city_gov_data)
        return prediction        
    except:
        return jsonify({'error':str(e)}),500
if __name__ == '__main__':
    app.run()
