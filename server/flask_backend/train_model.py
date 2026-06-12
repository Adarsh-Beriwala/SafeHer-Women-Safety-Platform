import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import os

# Create dummy synthetic data
np.random.seed(42)

# Generate 1000 rows
num_samples = 1000
data = {
    'time_of_day': np.random.randint(0, 24, num_samples),
    'distance_to_police': np.random.uniform(0.1, 10.0, num_samples), # km
    'street_light_density': np.random.uniform(10, 100, num_samples),
    'historical_crime_rate': np.random.uniform(0, 50, num_samples)
}

df = pd.DataFrame(data)

# Target: Safety Score (0-100)
# A simple heuristic to generate synthetic target scores
# Higher distance to police -> lower score
# Higher historical crime -> lower score
# Night time (18 to 5) -> lower score
# Higher street light density -> higher score

def calculate_synthetic_score(row):
    score = 80
    if row['time_of_day'] >= 18 or row['time_of_day'] <= 5:
        score -= 20
    score -= (row['distance_to_police'] * 2)
    score -= (row['historical_crime_rate'] * 0.5)
    score += (row['street_light_density'] * 0.2)
    
    # Bound between 0 and 100
    return max(0, min(100, score))

df['safety_score'] = df.apply(calculate_synthetic_score, axis=1)

X = df.drop('safety_score', axis=1)
y = df['safety_score']

# Train XGBoost model
print("Training XGBoost Model...")
model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100)
model.fit(X, y)

# Save the model
model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
joblib.dump(model, model_path)
print(f"Model saved successfully to {model_path}")
