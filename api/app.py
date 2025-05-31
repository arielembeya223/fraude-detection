from flask import Flask, jsonify, Response
from flask_cors import CORS
import random
import numpy as np
import joblib
import time
import json

app = Flask(__name__)

# Configuration CORS détaillée
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Chargement du modèle de détection de fraude
try:
    pipeline = joblib.load('fraud_detection_pipeline.pkl')
    print("Modèle chargé avec succès")
except Exception as e:
    print(f"Erreur lors du chargement du modèle : {e}")
    pipeline = None
    exit()

def generate_transaction(force_fraud=None):
    """Génère une transaction aléatoire avec détection de fraude"""
    is_fraud = random.choice([True, False]) if force_fraud is None else force_fraud

    # Simulation des caractéristiques de la transaction
    if is_fraud:
        amount = random.uniform(500, 5000)
        tx_type = random.randint(0, 1)
        prior_tx = random.randint(0, 5)
        risk_score = random.uniform(0.7, 1.0)
        hour = random.choice([0, 1, 2, 3, 4])  # Nuit
        total_amount = amount * random.uniform(1.5, 3.0)
        avg_amount = total_amount / max(1, prior_tx)
    else:
        amount = random.uniform(10, 500)
        tx_type = random.randint(0, 1)
        prior_tx = random.randint(5, 100)
        risk_score = random.uniform(0.0, 0.3)
        hour = random.randint(8, 20)  # Journée
        total_amount = amount * random.uniform(1.0, 1.5)
        avg_amount = total_amount / max(1, prior_tx)

    # Génération des données géographiques
    latitude = random.uniform(-70, 70)  # Évite les pôles
    longitude = random.uniform(-180, 180)
    source_account = f"ACC{random.randint(100000, 999999)}"
    destination_account = f"ACC{random.randint(100000, 999999)}"

    # Features pour le modèle
    features = np.array([
        amount, tx_type, prior_tx, risk_score, 
        hour, total_amount, avg_amount
    ], dtype=np.float32)

    return features, is_fraud, latitude, longitude, source_account, destination_account

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Endpoint pour récupérer un batch de transactions"""
    if not pipeline:
        return jsonify({"error": "Model not loaded"}), 500

    transactions = []
    for i in range(20):  # Génère 20 transactions
        try:
            features, is_fraud, lat, lon, src, dst = generate_transaction()
            prediction = pipeline.predict(features.reshape(1, -1))[0]
            
            transactions.append({
                "id": f"TX{int(time.time() * 1000)}{i}",
                "source": src,
                "target": dst,
                "amount": float(features[0]),
                "latitude": float(lat),
                "longitude": float(lon),
                "is_fraud": bool(is_fraud),
                "prediction": bool(prediction),
                "type": "transaction",
                "timestamp": int(time.time() * 1000),
                "features": {
                    "type": int(features[1]),
                    "prior_transactions": int(features[2]),
                    "risk_score": float(features[3]),
                    "hour": int(features[4])
                }
            })
        except Exception as e:
            print(f"Error generating transaction {i}: {e}")

    return jsonify(transactions)

@app.route('/api/transactions/stream', methods=['GET'])
def stream_transactions():
    """Endpoint de streaming SSE pour les transactions en temps réel"""
    def generate():
        while True:
            try:
                if not pipeline:
                    yield "data: {}\n\n"
                    time.sleep(1)
                    continue

                features, is_fraud, lat, lon, src, dst = generate_transaction()
                prediction = pipeline.predict(features.reshape(1, -1))[0]

                tx_data = {
                    "id": f"TX{int(time.time() * 1000)}",
                    "source": src,
                    "target": dst,
                    "amount": float(features[0]),
                    "latitude": float(lat),
                    "longitude": float(lon),
                    "is_fraud": bool(is_fraud),
                    "prediction": bool(prediction),
                    "timestamp": int(time.time() * 1000)
                }

                yield f"data: {json.dumps(tx_data)}\n\n"
                time.sleep(random.uniform(0.5, 2.5))

            except Exception as e:
                print(f"Error in stream: {e}")
                time.sleep(1)

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        }
    )

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de vérification de santé"""
    return jsonify({
        "status": "healthy",
        "model_loaded": pipeline is not None,
        "timestamp": int(time.time() * 1000)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)