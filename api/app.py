from flask import Flask, jsonify, Response
from flask_cors import CORS
import random
import numpy as np
import joblib
import time
import json

app = Flask(__name__)
CORS(app)

# Chargement du modèle
try:
    pipeline = joblib.load('fraud_detection_fin.pkl')
    print("Modèle chargé avec succès")
except Exception as e:
    print(f"Erreur de chargement: {e}")
    pipeline = None

# Configuration des continents avec des coordonnées terrestres
CONTINENTS = {
    'north_america': {
        'lat': (25, 50),  # Du Mexique au Canada
        'lon': (-125, -65)  # Côte ouest à côte est
    },
    'south_america': {
        'lat': (-35, 5),  # Terre de Feu au nord du Brésil
        'lon': (-75, -45)  # Zone continentale principale
    },
    'europe': {
        'lat': (35, 60),  # Du Portugal à la Scandinavie
        'lon': (-10, 40)   # De l'Irlande à l'Oural
    },
    'africa': {
        'lat': (-35, 35),  # Afrique du Sud au Maroc
        'lon': (-20, 50)    # De Dakar à Mogadiscio
    },
    'asia': {
        'lat': (10, 55),   # Moyen-Orient à Sibérie du Sud
        'lon': (60, 140)   # Turquie au Japon
    },
    'oceania': {
        'lat': (-45, -5),  # Nouvelle-Zélande à Papouasie
        'lon': (110, 180)  # Australie et îles principales
    }
}

HIGH_RISK_COUNTRIES = ['NG', 'RU', 'UA', 'ZA', 'BR', 'CO', 'MX', 'PH', 'IN', 'CN']

def generate_terrestrial_coordinates(continent):
    """Génère des coordonnées aléatoires principalement terrestres dans un continent"""
    if continent == 'north_america':
        # Concentrer sur les zones peuplées des USA et Canada
        lat = random.uniform(30, 48)
        lon = random.uniform(-120, -70)
        
    elif continent == 'south_america':
        # Éviter l'Amazonie et se concentrer sur les côtes
        lat = random.choice([
            random.uniform(-35, -20),  # Chili/Argentine
            random.uniform(-5, 5)      # Nord du Brésil/Colombie
        ])
        lon = random.uniform(-75, -50)
        
    elif continent == 'europe':
        # Concentrer sur l'Europe occidentale et centrale
        lat = random.uniform(40, 55)
        lon = random.uniform(-5, 30)
        
    elif continent == 'africa':
        # Éviter le Sahara central
        lat = random.choice([
            random.uniform(-35, -20),  # Afrique du Sud
            random.uniform(5, 20),     # Afrique de l'Ouest
            random.uniform(25, 35)     # Afrique du Nord
        ])
        lon = random.uniform(-15, 40)
        
    elif continent == 'asia':
        # Éviter les déserts et la Sibérie
        lat = random.choice([
            random.uniform(20, 40),   # Moyen-Orient à Chine
            random.uniform(5, 20)     # Asie du Sud-Est
        ])
        lon = random.uniform(70, 120)
        
    elif continent == 'oceania':
        # Australie et Nouvelle-Zélande
        lat = random.choice([
            random.uniform(-45, -35),  # Nouvelle-Zélande
            random.uniform(-30, -10)   # Australie
        ])
        lon = random.uniform(115, 155)
    
    return lat, lon

def is_high_risk(continent):
    """Détermine si la transaction est à haut risque"""
    return random.choice([True, False, False])

def generate_transaction(force_fraud=False):
    """Génère une transaction avec des caractéristiques réalistes"""
    is_fraud = force_fraud or (random.random() < 0.3)
    
    if is_fraud:
        amount = random.uniform(500, 10000)
        risk_score = random.uniform(0.7, 1.0)
        hour = random.choice([0, 1, 2, 3, 4, 23])
    else:
        amount = random.uniform(10, 2000)
        risk_score = random.uniform(0.0, 0.3)
        hour = random.randint(8, 20)
    
    if is_fraud and random.random() < 0.8:
        src_cont, tgt_cont = random.sample(list(CONTINENTS.keys()), 2)
    else:
        src_cont = random.choice(list(CONTINENTS.keys()))
        tgt_cont = random.choice(list(CONTINENTS.keys()))
    
    src_lat, src_lon = generate_terrestrial_coordinates(src_cont)
    tgt_lat, tgt_lon = generate_terrestrial_coordinates(tgt_cont)
    
    if is_fraud and random.random() < 0.4:
        tgt_lat = src_lat + random.choice([-30, 30])
        tgt_lon = src_lon + random.choice([-60, 60])
    
    features = np.array([
        amount,
        random.randint(0, 1),
        random.randint(1, 100),
        risk_score,
        hour,
        amount * random.uniform(0.8, 1.5),
        amount * random.uniform(0.5, 2.0)
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
                time.sleep(3)
                
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