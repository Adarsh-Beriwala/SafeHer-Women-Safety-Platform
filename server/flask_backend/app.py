from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
import datetime
import numpy as np

app = Flask(__name__)
CORS(app) # Allow cross-origin requests from React

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')

try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Warning: Could not load model: {e}")
    model = None

def get_features_for_location(lat, lng):
    # In a real app, we would query OpenStreetMap or a database to get features for this lat/lng
    # For now, we generate pseudo-random features based on the coordinates to keep it deterministic
    
    # Hash the lat/lng to get deterministic pseudo-random values
    seed = int((lat + lng) * 100000) % 10000
    np.random.seed(seed)
    
    current_hour = datetime.datetime.now().hour
    
    return {
        'time_of_day': current_hour,
        'distance_to_police': np.random.uniform(0.5, 8.0),
        'street_light_density': np.random.uniform(20, 90),
        'historical_crime_rate': np.random.uniform(5, 40)
    }

@app.route('/api/safety-score', methods=['POST'])
def safety_score():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500
        
    data = request.get_json()
    
    if not data or 'latitude' not in data or 'longitude' not in data:
        return jsonify({'error': 'Missing latitude or longitude'}), 400
        
    lat = float(data['latitude'])
    lng = float(data['longitude'])
    
    # Extract features
    features = get_features_for_location(lat, lng)
    
    # Create DataFrame for prediction
    df = pd.DataFrame([features])
    
    # Predict score
    try:
        prediction = model.predict(df)[0]
        score = max(0, min(100, float(prediction))) # Bound between 0 and 100
        
        return jsonify({
            'safety_score': round(score, 1),
            'features_used': features
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run the server
    app.run(host='0.0.0.0', port=5000, debug=True)
