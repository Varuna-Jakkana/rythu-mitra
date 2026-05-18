# ==============================
# 1. IMPORT LIBRARIES
# ==============================
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
import cv2
import numpy as np
import requests
import joblib
import os

# ==============================
# 2. INIT APP
# ==============================
app = Flask(__name__)
CORS(app)

# ==============================
# 3. LOAD MODELS
# ==============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

soil_model = load_model(
    os.path.join(BASE_DIR, "models/soil_model_fixed.h5"),
    compile=False
)

crop_model = joblib.load(
    os.path.join(BASE_DIR, "models/crop_model.pkl")
)

print("✅ Models loaded")

# ==============================
# 4. LABELS
# ==============================
soil_classes = ['black', 'clay', 'loamy', 'red', 'sandy']

crop_labels = {
    0: "Barley",
    1: "Cotton",
    2: "Groundnut",
    3: "Maize",
    4: "Millets",
    5: "Oil seeds",
    6: "Paddy",
    7: "Pulses",
    8: "Sugarcane",
    9: "Tobacco",
    10: "Wheat"
}

# ==============================
# 5. HOME ROUTE
# ==============================
@app.route('/')
def home():
    return "✅ Backend Running with AI + Weather"

def get_smart_npk(soil_type, humidity, region):

    # --------------------------
    # BASE NPK (same as before)
    # --------------------------
    base_npk = {
        "black": [80, 40, 40],
        "red": [40, 30, 30],
        "sandy": [20, 20, 20],
        "loamy": [60, 50, 50],
        "clay": [70, 60, 60]
    }

    N, P, K = base_npk.get(soil_type, [50, 40, 40])

    # --------------------------
    # ADJUST USING HUMIDITY (RAINFALL EFFECT)
    # --------------------------

    # High humidity → nutrients wash away
    if humidity > 70:
        N -= 10
        K -= 5

    # Low humidity → dry soil → low fertility
    elif humidity < 40:
        N -= 5
        P -= 5

    # --------------------------
    # ADJUST USING REGION
    # --------------------------

    # Example region logic (based on your mapping)
    # region 0 = south (fertile)
    # region 3 = dry areas

    if region == 0:
        N += 5

    elif region == 3:
        N -= 10
        P -= 5

    # --------------------------
    # SAFETY (no negative values)
    # --------------------------
    N = max(N, 10)
    P = max(P, 10)
    K = max(K, 10)

    return N, P, K
# ==============================
# 6. PREDICT ROUTE
# ==============================
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # --------------------------
        # IMAGE PROCESSING
        # --------------------------
        file = request.files['image']

        image = cv2.imdecode(
            np.frombuffer(file.read(), np.uint8),
            cv2.IMREAD_COLOR
        )
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, (150, 150))
        image = image / 255.0
        image = np.expand_dims(image, axis=0)

        # --------------------------
        # SOIL PREDICTION
        # --------------------------
        pred = soil_model.predict(image)
        soil_type = soil_classes[np.argmax(pred)]

        # --------------------------
        # LOCATION
        # --------------------------
        try:
            loc_res = requests.get("http://ip-api.com/json/", timeout=2)
            loc_data = loc_res.json()
            lat = loc_data['lat']
            lon = loc_data['lon']
        except:
            return jsonify({
                "error": "No internet connection. Please turn on mobile data."
                }), 400

        # --------------------------
        # WEATHER
        # --------------------------
        API_KEY = "a3ddda72a1824497fdbdbd6ed51932e5"

        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
            res = requests.get(url, timeout=3)
            data = res.json()
            temperature = data["main"]["temp"]
            humidity = data["main"]["humidity"]
        
        except:
            return jsonify({
                "error": "Unable to fetch weather data. Check your internet connection."
                }), 400

        # --------------------------
        # REGION
        # --------------------------
        def get_region(lat):
            if lat < 15:
                return 0
            elif lat < 22:
                return 3
            elif lat < 28:
                return 2
            else:
                return 1

        region = get_region(lat)

        # --------------------------
        # NDVI
        # --------------------------
        ndvi_map = {
            0: 0.75,
            1: 0.45,
            2: 0.85,
            3: 0.65
        }
        ndvi = ndvi_map[region]

        # --------------------------
        # MOISTURE
        # --------------------------
        if humidity > 70:
            moisture = 70
        elif humidity > 50:
            moisture = 50
        else:
            moisture = 30

        # --------------------------
        # ENCODE SOIL
        # --------------------------
        soil_encoded = soil_classes.index(soil_type)

        # --------------------------
        # ✅ SMART NPK (FIXED)
        # --------------------------
        N, P, K = get_smart_npk(soil_type, humidity, region)

        print("Soil:", soil_type)
        print("NPK:", N, P, K)

        # --------------------------
        # FINAL INPUT
        # --------------------------
        input_data = [[
            temperature,
            humidity,
            moisture,
            soil_encoded,
            region,
            ndvi
        ]]

        # --------------------------
        # PREDICTION
        # --------------------------
        probs = crop_model.predict_proba(input_data)[0]

        # --------------------------
        # ✅ RULE FILTERING (FIXED)
        # --------------------------
        for i, crop in crop_labels.items():

            if soil_type == "sandy" and crop == "Paddy":
                probs[i] = 0

            if moisture < 40 and crop == "Sugarcane":
                probs[i] = 0

            if humidity < 50 and crop == "Paddy":
                probs[i] = 0

        # --------------------------
        # TOP 3
        # --------------------------
        top3 = probs.argsort()[-3:][::-1]

        results = []
        for i in top3:
            results.append({
                "crop": crop_labels[i],
                "confidence": float(round(probs[i], 2))
            })

        # --------------------------
        # RESPONSE
        # --------------------------
        return jsonify({
            "soil": soil_type,
            "temperature": temperature,
            "humidity": humidity,
            "crops": results
        })

    except Exception as e:
        return jsonify({"error": str(e)})
# ==============================
# 7. RUN SERVER
# ==============================
if __name__ == '__main__':
    app.run(debug=True)