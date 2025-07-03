from flask import Flask, jsonify, Response
from flask_cors import CORS
import random
import numpy as np
import joblib
import time
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Chargement du modèle
try:
    pipeline = joblib.load('fraud_detection_fin.pkl')
    print("Modèle chargé avec succès")
except Exception as e:
    print(f"Erreur de chargement: {e}")
    pipeline = None

# Configuration des continents
CONTINENTS = {
    'north_america': {'lat': (25, 50), 'lon': (-130, -60)},
    'south_america': {'lat': (-55, 15), 'lon': (-85, -30)},
    'europe': {'lat': (35, 70), 'lon': (-25, 50)},
    'africa': {'lat': (-35, 35), 'lon': (-20, 55)},
    'asia': {'lat': (5, 60), 'lon': (40, 150)},
    'oceania': {'lat': (-50, -5), 'lon': (100, 180)}
}

HIGH_RISK_COUNTRIES = ['NG', 'RU', 'UA', 'ZA', 'BR', 'CO', 'MX', 'PH', 'IN', 'CN']

def generate_coordinates(continent):
    """Génère des coordonnées aléatoires dans un continent"""
    lat = random.uniform(*CONTINENTS[continent]['lat'])
    lon = random.uniform(*CONTINENTS[continent]['lon'])
    return lat, lon

def is_high_risk(continent):
    """Détermine si la transaction est à haut risque"""
    return random.choice([True, False, False])  # 1/3 de chance

def generate_transaction(force_fraud=False):
    """Génère une transaction avec des caractéristiques réalistes"""
    # Augmentation des fraudes (30% au lieu de 10%)
    is_fraud = force_fraud or (random.random() < 0.3)
    
    # Caractéristiques différentes pour fraude/non-fraude
    if is_fraud:
        amount = random.uniform(500, 10000)
        risk_score = random.uniform(0.7, 1.0)
        hour = random.choice([0, 1, 2, 3, 4, 23])  # Heures suspectes
    else:
        amount = random.uniform(10, 2000)
        risk_score = random.uniform(0.0, 0.3)
        hour = random.randint(8, 20)
    
    # Choix des continents (plus souvent inter-continents pour les fraudes)
    if is_fraud and random.random() < 0.8:  # 80% inter-continents
        src_cont, tgt_cont = random.sample(list(CONTINENTS.keys()), 2)
    else:
        src_cont = random.choice(list(CONTINENTS.keys()))
        tgt_cont = random.choice(list(CONTINENTS.keys()))
    
    # Génération des coordonnées
    src_lat, src_lon = generate_coordinates(src_cont)
    tgt_lat, tgt_lon = generate_coordinates(tgt_cont)
    
    # Pour les fraudes, on ajoute parfois des distances extrêmes
    if is_fraud and random.random() < 0.4:
        if random.choice([True, False]):
            tgt_lat = src_lat + random.choice([-30, 30])
            tgt_lon = src_lon + random.choice([-60, 60])
        else:
            # Transaction entre hémisphères opposés
            tgt_lat = -src_lat * 0.8
            tgt_lon = src_lon + 180 if src_lon < 0 else src_lon - 180
    
    # Features pour le modèle
    features = np.array([
        amount,
        random.randint(0, 1),  # type
        random.randint(1, 100),  # nb transactions
        risk_score,
        hour,
        amount * random.uniform(0.8, 1.5),  # total amount
        amount * random.uniform(0.5, 2.0)   # avg amount
    ], dtype=np.float32)
    
    return {
        'features': features,
        'is_fraud': is_fraud,
        'geo': {
            'src_lat': src_lat,
            'src_lon': src_lon,
            'tgt_lat': tgt_lat,
            'tgt_lon': tgt_lon
        },
        'accounts': (
            f"ACC{random.randint(100000, 999999)}",
            f"ACC{random.randint(100000, 999999)}"
        ),
        'timestamp': int(time.time() * 1000)
    }

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Endpoint batch avec plus de fraudes"""
    if not pipeline:
        return jsonify({"error": "Model not loaded"}), 500
    
    transactions = []
    for _ in range(20):
        try:
            tx = generate_transaction()
            proba = pipeline.predict_proba(tx['features'].reshape(1, -1))[0][1]
            
            transactions.append({
                "id": f"TX{tx['timestamp']}",
                "source": tx['accounts'][0],
                "target": tx['accounts'][1],
                "source_latitude": tx['geo']['src_lat'],
                "source_longitude": tx['geo']['src_lon'],
                "target_latitude": tx['geo']['tgt_lat'],
                "target_longitude": tx['geo']['tgt_lon'],
                "amount": float(tx['features'][0]),
                "is_fraud": tx['is_fraud'],
                "fraud_probability": float(proba),
                "status": 'fraud' if tx['is_fraud'] else ('hot_potential' if proba > 0.4 else 'safe'),
                "timestamp": tx['timestamp']
            })
        except Exception as e:
            print(f"Error generating transaction: {e}")
    
    return jsonify(transactions)

@app.route('/api/transactions/stream', methods=['GET'])
def stream_transactions():
    """Streaming avec plus de fraudes et distances variables"""
    def generate():
        while True:
            try:
                if not pipeline:
                    yield "data: {}\n\n"
                    time.sleep(1)
                    continue
                
                # Génère plus souvent des fraudes (1 sur 3)
                tx = generate_transaction(force_fraud=random.random() < 0.33)
                proba = pipeline.predict_proba(tx['features'].reshape(1, -1))[0][1]
                
                data = {
                    "id": f"TX{tx['timestamp']}",
                    "source": tx['accounts'][0],
                    "target": tx['accounts'][1],
                    "source_latitude": tx['geo']['src_lat'],
                    "source_longitude": tx['geo']['src_lon'],
                    "target_latitude": tx['geo']['tgt_lat'],
                    "target_longitude": tx['geo']['tgt_lon'],
                    "amount": float(tx['features'][0]),
                    "is_fraud": tx['is_fraud'],
                    "fraud_probability": float(proba),
                    "status": 'fraud' if tx['is_fraud'] else ('hot_potential' if proba > 0.4 else 'safe'),
                    "timestamp": tx['timestamp']
                }
                
                yield f"data: {json.dumps(data)}\n\n"
                time.sleep(random.uniform(0.1, 1.5))  # Délai variable
                
            except Exception as e:
                print(f"Stream error: {e}")
                time.sleep(1)
    
    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={'Cache-Control': 'no-cache'}
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)