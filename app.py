from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
import joblib

app = Flask(__name__)

# Load model & scaler with custom loss function
model = tf.keras.models.load_model("fashion_model.h5", custom_objects={"mse": tf.keras.losses.MeanSquaredError()})
scaler = joblib.load("scaler.pkl")  # Ensure this file exists

@app.route('/')
def home():
    return "✅ Sustainable Fashion AI API is running! Use the /predict endpoint."

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    X_input = np.array(data["features"]).reshape(1, -1)
    X_scaled = scaler.transform(X_input)
    
    prediction = model.predict(X_scaled)[0][0]
    return jsonify({"predicted_value": float(prediction)})

if __name__ == '__main__':
    app.run(debug=True)
