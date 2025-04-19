from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
import os
import numpy as np
import joblib
import pickle
from PIL import Image
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models
from werkzeug.utils import secure_filename
import requests
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# ========== CROP RECOMMENDATION SETUP ==========
RF = joblib.load("models/random_forest_model.pkl")
ms = joblib.load("models/scaler.pkl")

crop_dict = {
    1: 'maize', 2: 'sugarcane', 3: 'wheat', 4: 'cotton', 5: 'rice',
    6: 'pulses', 7: 'millets', 8: 'mungbean', 9: 'blackgram',
    10: 'lentil', 11: 'banana', 12: 'mango', 13: 'grapes'
}

punjab_districts = [
    "Attock", "Bahawalnagar", "Bahawalpur", "Bhakkar", "Chakwal",
    "Chiniot", "Dera Ghazi Khan", "Faisalabad", "Gujranwala", "Gujrat",
    "Hafizabad", "Jhang", "Jhelum", "Kasur", "Khanewal", "Khushab",
    "Lahore", "Layyah", "Lodhran", "Mandi Bahauddin", "Mianwali",
    "Multan", "Muzaffargarh", "Narowal", "Nankana Sahib", "Okara",
    "Pakpattan", "Rahim Yar Khan", "Rajanpur", "Rawalpindi", "Sahiwal",
    "Sargodha", "Sheikhupura", "Sialkot", "Toba Tek Singh", "Vehari"
]

district_mapping = {district: idx for idx, district in enumerate(punjab_districts)}

@app.route("/predict-CropRecommendation", methods=["POST"])
def predict_crop():
    try:
        data = request.get_json()
        N = float(data["N"])
        P = float(data["P"])
        K = float(data["K"])
        temperature = float(data["temperature"])
        humidity = float(data["humidity"])
        ph = float(data["ph"])
        rainfall = float(data["rainfall"])
        district = data["district"]
        district_encoded = district_mapping[district]

        features = np.array([[N, P, K, temperature, humidity, ph, rainfall, district_encoded]])
        transformed_features = ms.transform(features)
        prediction = RF.predict(transformed_features)[0]

        crop = crop_dict.get(prediction, "Unknown")
        message = f"You should grow {crop.capitalize()} in your farm." if crop != "Unknown" else \
                  "Sorry, we are not able to recommend a proper crop for this environment."

        return jsonify({"message": message})
    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500

# ========== DISEASE PREDICTION SETUP ==========
UPLOAD_FOLDER = 'static/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

disease_classes = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy'
]

disease_model = models.resnet50(pretrained=False)
num_ftrs = disease_model.fc.in_features
disease_model.fc = nn.Linear(num_ftrs, len(disease_classes))

try:
    disease_model.load_state_dict(torch.load("models/plant_disease_model_latest.pth", map_location=device))
    print("✅ Disease model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading disease model: {e}")

disease_model.to(device)
disease_model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

disease_info = {
    'Apple___Apple_scab': {
        'cause': 'Fungal infection caused by Venturia inaequalis.',
        'cure': 'Apply fungicides like myclobutanil or sulfur-based sprays.'
    },
    'Apple___Black_rot': {
        'cause': 'Fungal disease caused by Botryosphaeria obtusa.',
        'cure': 'Prune affected branches and apply copper-based fungicides.'
    },
    'Apple___Cedar_apple_rust': {
        'cause': 'Fungal disease caused by Gymnosporangium juniperi-virginianae.',
        'cure': 'Remove nearby cedar trees and use fungicides containing myclobutanil.'
    },
    'Apple___healthy': {
        'cause': 'No disease detected.',
        'cure': 'No action required. Keep monitoring for signs of disease.'
    },
    'Grape___Black_rot': {
        'cause': 'Fungal infection caused by Guignardia bidwellii.',
        'cure': 'Use fungicides like mancozeb or captan. Prune infected parts.'
    },
    'Grape___Esca_(Black_Measles)': {
        'cause': 'Complex fungal disease caused by Phaeomoniella chlamydospora.',
        'cure': 'Remove infected vines and apply appropriate fungicides.'
    },
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
        'cause': 'Fungal infection caused by Isariopsis clavispora.',
        'cure': 'Use fungicides like chlorothalonil or mancozeb.'
    },
    'Grape___healthy': {
        'cause': 'No disease detected.',
        'cure': 'No action required. Maintain good vineyard practices.'
    },
    'Potato___Early_blight': {
        'cause': 'Fungal disease caused by Alternaria solani.',
        'cure': 'Apply fungicides like chlorothalonil. Rotate crops regularly.'
    },
    'Potato___Late_blight': {
        'cause': 'Fungal disease caused by Phytophthora infestans.',
        'cure': 'Use fungicides like metalaxyl. Remove infected plants immediately.'
    },
    'Potato___healthy': {
        'cause': 'No disease detected.',
        'cure': 'No action required. Monitor for signs of disease.'
    }
}

def predict_image(image_path):
    try:
        image = Image.open(image_path)
        image = transform(image).unsqueeze(0).to(device)
        with torch.no_grad():
            output = disease_model(image)
            _, predicted_class = torch.max(output, 1)
        return disease_classes[predicted_class.item()]
    except Exception as e:
        return f"❌ Error processing image: {e}"

@app.route('/predict-disease', methods=['POST'])
def disease_prediction():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    image_path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
    file.save(image_path)

    prediction = predict_image(image_path)

    if prediction in disease_info:
        crop = prediction.split('___')[0]
        disease = prediction.split('___')[1] if 'healthy' not in prediction else 'Healthy'
        cause = disease_info[prediction]['cause']
        cure = disease_info[prediction]['cure']
        return jsonify({
            "crop": crop,
            "disease": disease,
            "cause": cause,
            "cure": cure
        })
    else:
        return jsonify({"prediction": "Unknown disease"})

# ========== PRODUCTION PREDICTION SETUP ==========

# Load model and preprocessor
with open("models/dtr.pkl", "rb") as file:
    dtr = pickle.load(file)

with open("models/preprocessor.pkl", "rb") as file:
    preprocessor = pickle.load(file)

print("✅ Production prediction model loaded!")

@app.route("/crop-yield-predict", methods=['POST'])
def predict_production():
    try:
        data = request.get_json()
        
        Year = int(data['Year'])
        average_rain_fall_mm_per_year = float(data['average_rain_fall_mm_per_year'])
        pesticides_tonnes = float(data['pesticides_tonnes'])
        avg_temp = float(data['avg_temp'])
        Area = data['Area']
        Item = data['Item']

        features = np.array([[Year, average_rain_fall_mm_per_year, pesticides_tonnes, avg_temp, Area, Item]], dtype=object)
        transformed_features = preprocessor.transform(features)
        prediction = dtr.predict(transformed_features).reshape(1, -1)

        prediction_value = round(prediction[0][0], 2)

        return jsonify({'prediction': [[prediction_value]]})
    
    except Exception as e:
        print("❌ Error:", e)
        return jsonify({'error': str(e)}), 500
    

# ========== WEATHER ADVISOR SETUP ==========

# Load trained weather model (not actively used in current suitability check)
model_path = "models/weather_model.pkl"
with open(model_path, "rb") as file:
    weather_model = pickle.load(file)

API_KEY = "9b719390e90530f0a29ee4ddc3d7c5fb"
API_URL = "http://api.openweathermap.org/data/2.5/weather"

# Crop suitability based on temperature and humidity
crop_conditions = {
    "wheat": {"temp_min": 10, "temp_max": 25, "humidity_min": 40, "humidity_max": 70},
    "rice": {"temp_min": 20, "temp_max": 35, "humidity_min": 60, "humidity_max": 90},
    "cotton": {"temp_min": 25, "temp_max": 40, "humidity_min": 50, "humidity_max": 80},
    "maize": {"temp_min": 18, "temp_max": 30, "humidity_min": 50, "humidity_max": 85},
    "sugarcane": {"temp_min": 20, "temp_max": 38, "humidity_min": 60, "humidity_max": 85},
    "barley": {"temp_min": 5, "temp_max": 20, "humidity_min": 30, "humidity_max": 60},
    "sunflower": {"temp_min": 15, "temp_max": 30, "humidity_min": 40, "humidity_max": 70},
    "millet": {"temp_min": 20, "temp_max": 35, "humidity_min": 50, "humidity_max": 75},
    "gram": {"temp_min": 10, "temp_max": 25, "humidity_min": 40, "humidity_max": 60},
    "mustard": {"temp_min": 15, "temp_max": 25, "humidity_min": 30, "humidity_max": 55},
    "soybean": {"temp_min": 20, "temp_max": 30, "humidity_min": 50, "humidity_max": 75},
    "peanuts": {"temp_min": 25, "temp_max": 35, "humidity_min": 50, "humidity_max": 80},
    "banana": {"temp_min": 20, "temp_max": 35, "humidity_min": 70, "humidity_max": 90},
    "orange": {"temp_min": 15, "temp_max": 30, "humidity_min": 50, "humidity_max": 70},
    "apple": {"temp_min": 0, "temp_max": 20, "humidity_min": 40, "humidity_max": 60},
    "mango": {"temp_min": 20, "temp_max": 40, "humidity_min": 60, "humidity_max": 85},
    "guava": {"temp_min": 15, "temp_max": 35, "humidity_min": 50, "humidity_max": 75},
    "papaya": {"temp_min": 22, "temp_max": 35, "humidity_min": 60, "humidity_max": 85},
    "watermelon": {"temp_min": 25, "temp_max": 40, "humidity_min": 50, "humidity_max": 80},
    "tomato": {"temp_min": 18, "temp_max": 30, "humidity_min": 50, "humidity_max": 75},
    "potato": {"temp_min": 5, "temp_max": 20, "humidity_min": 40, "humidity_max": 60},
    "onion": {"temp_min": 15, "temp_max": 30, "humidity_min": 50, "humidity_max": 70},
    "garlic": {"temp_min": 10, "temp_max": 25, "humidity_min": 40, "humidity_max": 60},
    "carrot": {"temp_min": 5, "temp_max": 20, "humidity_min": 40, "humidity_max": 60},
    "spinach": {"temp_min": 5, "temp_max": 20, "humidity_min": 40, "humidity_max": 70},
    "cabbage": {"temp_min": 5, "temp_max": 25, "humidity_min": 40, "humidity_max": 70}
}




def get_weather_data(district):
    params = {"q": f"{district},PK", "appid": API_KEY, "units": "metric"}
    response = requests.get(API_URL, params=params)

    if response.status_code == 200:
        data = response.json()
        return {
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "weather": data["weather"][0]["description"]
        }
    else:
        return None


def predict_crop_suitability(district, crop):
    weather_data = get_weather_data(district)

    if not weather_data:
        return {"error": "Weather data not available"}

    temp = weather_data["temperature"]
    humidity = weather_data["humidity"]
    weather = weather_data["weather"]

    crop_data = crop_conditions.get(crop.lower())
    if not crop_data:
        return {"error": "Invalid crop selected"}

    temp_suitable = crop_data["temp_min"] <= temp <= crop_data["temp_max"]
    humidity_suitable = crop_data["humidity_min"] <= humidity <= crop_data["humidity_max"]

    if temp_suitable and humidity_suitable:
        recommendation = f"{crop.capitalize()} is suitable in {district} based on current weather."
    elif temp_suitable or humidity_suitable:
        recommendation = f"{crop.capitalize()} is partially suitable in {district}. Conditions are close."
    else:
        recommendation = f"{crop.capitalize()} is not suitable in {district} based on current weather."

    return {
        "district": district,
        "temperature": temp,
        "humidity": humidity,
        "weather": weather,
        "crop": crop,
        "recommendation": recommendation
    }


@app.route("/weather-advisor", methods=["POST"])
def predict():
    data = request.get_json()

    district = data.get("district")
    crop = data.get("crop")

    if not district or not crop:
        return jsonify({"error": "Missing district or crop"}), 400

    result = predict_crop_suitability(district, crop)

    if "error" in result:
        return jsonify({"error": result["error"]}), 400
    else:
        return jsonify(result)
    

if __name__ == "__main__":
    app.run(debug=True)





# from flask import Flask, render_template, request, jsonify
# from flask_cors import CORS
# import numpy as np
# import joblib
# import os

# app = Flask(__name__)

# # Enable CORS for all routes
# CORS(app, resources={r"/*": {"origins": "http://localhost:5174"}})

# # Load the trained model and scaler
# RF = joblib.load("models/random_forest_model.pkl")
# ms = joblib.load("models/scaler.pkl")

# # Crop dictionary for mapping predictions
# crop_dict = {
#     1: 'maize', 2: 'sugarcane', 3: 'wheat', 4: 'cotton', 5: 'rice',
#     6: 'pulses', 7: 'millets', 8: 'mungbean', 9: 'blackgram',
#     10: 'lentil', 11: 'banana', 12: 'mango', 13: 'grapes'
# }

# # Hardcoded list of Punjab districts
# punjab_districts = [
#     "Attock", "Bahawalnagar", "Bahawalpur", "Bhakkar", "Chakwal",
#     "Chiniot", "Dera Ghazi Khan", "Faisalabad", "Gujranwala", "Gujrat",
#     "Hafizabad", "Jhang", "Jhelum", "Kasur", "Khanewal", "Khushab",
#     "Lahore", "Layyah", "Lodhran", "Mandi Bahauddin", "Mianwali",
#     "Multan", "Muzaffargarh", "Narowal", "Nankana Sahib", "Okara",
#     "Pakpattan", "Rahim Yar Khan", "Rajanpur", "Rawalpindi", "Sahiwal",
#     "Sargodha", "Sheikhupura", "Sialkot", "Toba Tek Singh", "Vehari"
# ]

# # District mapping (replace with your actual district mapping)
# district_mapping = {district: idx for idx, district in enumerate(punjab_districts)}

# @app.route("/predict-CropRecommendation", methods=["POST"])
# def predict():
#     try:
#         # Get user inputs from the JSON body
#         data = request.get_json()  # Get the incoming JSON data
        
#         N = float(data["N"])  # Nitrogen
#         P = float(data["P"])  # Phosphorus
#         K = float(data["K"])  # Potassium
#         temperature = float(data["temperature"])
#         humidity = float(data["humidity"])
#         ph = float(data["ph"])
#         rainfall = float(data["rainfall"])
#         district = data["district"]  # Selected district

#         # Map district to its encoded value
#         district_encoded = district_mapping[district]

#         # Prepare features
#         features = np.array([[N, P, K, temperature, humidity, ph, rainfall, district_encoded]])
#         transformed_features = ms.transform(features)

#         # Predict crop using the trained model
#         prediction = RF.predict(transformed_features)[0]

#         # Map prediction to crop name
#         if prediction in crop_dict:
#             crop = crop_dict[prediction]
#             message = f"You should grow {crop.capitalize()} in your farm."
#         else:
#             message = "Sorry, we are not able to recommend a proper crop for this environment."

#         # Return the message as JSON response
#         return jsonify({"message": message})

#     except Exception as e:
#         return jsonify({"error": f"Error: {str(e)}"})

# if __name__ == "__main__":
#     app.run(debug=True)
