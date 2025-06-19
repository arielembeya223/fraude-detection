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
    """Génère une transaction aléatoire avec des positions géographiques par continent"""
    is_fraud = random.choice([True, False]) if force_fraud is None else force_fraud

    # Simulation des caractéristiques de la transaction
    if is_fraud:
        amount = random.uniform(500, 5000)
        tx_type = random.randint(0, 1)
        prior_tx = random.randint(0, 5)
        risk_score = random.uniform(0.7, 1.0)
        hour = random.choice([0, 1, 2, 3, 4])
        total_amount = amount * random.uniform(1.5, 3.0)
        avg_amount = total_amount / max(1, prior_tx)
    else:
        amount = random.uniform(10, 500)
        tx_type = random.randint(0, 1)
        prior_tx = random.randint(5, 100)
        risk_score = random.uniform(0.0, 0.3)
        hour = random.randint(8, 20)
        total_amount = amount * random.uniform(1.0, 1.5)
        avg_amount = total_amount / max(1, prior_tx)

    # Définir les régions continentales (latitude, longitude, étendue)
    continents = {
        'north_america': {'lat_range': (30, 50), 'lon_range': (-130, -70)},
        'south_america': {'lat_range': (-40, 10), 'lon_range': (-80, -40)},
        'europe': {'lat_range': (35, 60), 'lon_range': (-10, 30)},
        'africa': {'lat_range': (-35, 20), 'lon_range': (-20, 50)},
        'asia': {'lat_range': (10, 50), 'lon_range': (60, 120)},
        'australia': {'lat_range': (-40, -10), 'lon_range': (110, 155)}
    }

    # Choisir deux continents distincts pour source et target
    source_continent, target_continent = random.sample(list(continents.keys()), 2)
    
    # Générer des coordonnées pour la source
    source_region = continents[source_continent]
    source_lat = random.uniform(*source_region['lat_range'])
    source_lon = random.uniform(*source_region['lon_range'])
    
    # Générer des coordonnées pour la target
    target_region = continents[target_continent]
    target_lat = random.uniform(*target_region['lat_range'])
    target_lon = random.uniform(*target_region['lon_range'])

    # Pour les fraudes, on peut parfois avoir des connexions intra-continentales
    # mais avec une distance minimale
    if is_fraud and random.random() < 0.3:
        target_lat = source_lat + random.uniform(5, 15) * random.choice([-1, 1])
        target_lon = source_lon + random.uniform(5, 15) * random.choice([-1, 1])
        
        # Clamping
        target_lat = max(-90, min(90, target_lat))
        target_lon = max(-180, min(180, target_lon))

    source_account = f"ACC{random.randint(100000, 999999)}"
    destination_account = f"ACC{random.randint(100000, 999999)}"

    features = np.array([
        amount, tx_type, prior_tx, risk_score,
        hour, total_amount, avg_amount
    ], dtype=np.float32)

    return (
        features, is_fraud,
        source_lat, source_lon,
        target_lat, target_lon,
        source_account, destination_account
    )
 

    # Simulation des caractéristiques de la transaction
    if is_fraud:
        amount = random.uniform(500, 5000)
        tx_type = random.randint(0, 1)
        prior_tx = random.randint(0, 5)
        risk_score = random.uniform(0.7, 1.0)
        hour = random.choice([0, 1, 2, 3, 4])
        total_amount = amount * random.uniform(1.5, 3.0)
        avg_amount = total_amount / max(1, prior_tx)
    else:
        amount = random.uniform(10, 500)
        tx_type = random.randint(0, 1)
        prior_tx = random.randint(5, 100)
        risk_score = random.uniform(0.0, 0.3)
        hour = random.randint(8, 20)
        total_amount = amount * random.uniform(1.0, 1.5)
        avg_amount = total_amount / max(1, prior_tx)

    source_lat = random.uniform(-70, 70)
    source_lon = random.uniform(-180, 180)

    # Distance minimale en degrés pour éviter lignes plates
    min_distance_deg = 0.5
    max_tries = 10
    for _ in range(max_tries):
        target_lat = source_lat + random.uniform(-2, 2)
        target_lon = source_lon + random.uniform(-2, 2)

        # Clamping
        target_lat = max(-90, min(90, target_lat))
        target_lon = max(-180, min(180, target_lon))

        delta_lat = abs(target_lat - source_lat)
        delta_lon = abs(target_lon - source_lon)

        # ✅ Vérifie que les deux dimensions sont suffisamment différentes
        if delta_lat >= min_distance_deg and delta_lon >= min_distance_deg:
            break
    else:
        # En cas d’échec, forcer un écart suffisant
        target_lat = source_lat + min_distance_deg * (1 if random.random() < 0.5 else -1)
        target_lon = source_lon + min_distance_deg * (1 if random.random() < 0.5 else -1)

    source_account = f"ACC{random.randint(100000, 999999)}"
    destination_account = f"ACC{random.randint(100000, 999999)}"

    features = np.array([
        amount, tx_type, prior_tx, risk_score,
        hour, total_amount, avg_amount
    ], dtype=np.float32)

    return (
        features, is_fraud,
        source_lat, source_lon,
        target_lat, target_lon,
        source_account, destination_account
    )


@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Endpoint pour récupérer un batch de transactions avec positions distinctes"""
    if not pipeline:
        return jsonify({"error": "Model not loaded"}), 500

    transactions = []
    for i in range(20):  # Génère 20 transactions
        try:
            (features, is_fraud, 
             source_lat, source_lon, 
             target_lat, target_lon, 
             src, dst) = generate_transaction()
            
            prediction = pipeline.predict(features.reshape(1, -1))[0]
            
            transactions.append({
                "id": f"TX{int(time.time() * 1000)}{i}",
                "source": src,
                "target": dst,
                "source_latitude": float(source_lat),
                "source_longitude": float(source_lon),
                "target_latitude": float(target_lat),
                "target_longitude": float(target_lon),
                "amount": float(features[0]),
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
    """Endpoint de streaming SSE avec positions distinctes"""
    def generate():
        while True:
            try:
                if not pipeline:
                    yield "data: {}\n\n"
                    time.sleep(1)
                    continue

                (features, is_fraud, 
                 source_lat, source_lon, 
                 target_lat, target_lon, 
                 src, dst) = generate_transaction()
                
                prediction = pipeline.predict(features.reshape(1, -1))[0]

                tx_data = {
                    "id": f"TX{int(time.time() * 1000)}",
                    "source": src,
                    "target": dst,
                    "source_latitude": float(source_lat),
                    "source_longitude": float(source_lon),
                    "target_latitude": float(target_lat),
                    "target_longitude": float(target_lon),
                    "amount": float(features[0]),
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