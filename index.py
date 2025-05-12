import random
import numpy as np
import joblib
import time

# Charger le pipeline (scaler + modèle) entraîné
try:
    pipeline = joblib.load('fraud_detection_pipeline.pkl')
except Exception as e:
    print(f"Erreur lors du chargement du modèle : {e}")
    exit()

# Simuler une transaction frauduleuse ou normale
def generate_transaction(force_fraud=None):
    is_fraud = random.choice([True, False]) if force_fraud is None else force_fraud

    # Simuler des informations sur la transaction
    if is_fraud:
        amount = random.uniform(5000, 10000)
        tx_type = random.randint(0, 1)
        prior_tx = random.randint(0, 1)
        risk_score = random.uniform(0.7, 1.0)
        hour = random.choice([0, 1, 2, 3])
        total_amount = random.uniform(5000, 10000)
        avg_amount = total_amount / random.randint(1, 5)
    else:
        amount = random.uniform(10, 500)
        tx_type = random.randint(0, 1)
        prior_tx = random.randint(5, 100)
        risk_score = random.uniform(0.0, 0.3)
        hour = random.randint(8, 18)
        total_amount = random.uniform(10, 500)
        avg_amount = total_amount / random.randint(1, 5)

    # Simuler la localisation (latitude et longitude) et les comptes source et destinataire
    latitude = random.uniform(-90, 90)  # Latitude aléatoire
    longitude = random.uniform(-180, 180)  # Longitude aléatoire
    source_account = random.randint(1000, 9999)  # Compte source aléatoire
    destination_account = random.randint(1000, 9999)  # Compte destinataire aléatoire

    # Rassembler toutes les caractéristiques utilisées pour le modèle (sans la localisation et les comptes)
    features = np.array([amount, tx_type, prior_tx, risk_score, hour, total_amount, avg_amount], dtype=np.float32)

    return features, is_fraud, latitude, longitude, source_account, destination_account

# Simulation principale
print("\n=== Simulateur de transactions bancaires ===\n")

try:
    for i in range(50):
        transaction, is_fraud, latitude, longitude, source_account, destination_account = generate_transaction()
        transaction_reshaped = transaction.reshape(1, -1)

        prediction = pipeline.predict(transaction_reshaped)[0]

        # Affichage des résultats dans le terminal
        print(f"Transaction {i+1}")
        print(f"  Données simulées : {transaction}")
        print(f"  Vérité terrain   : {'🚨 FRAUDE' if is_fraud else '✅ Normale'}")
        print(f"  Prédiction modèle: {'🚨 FRAUDE' if prediction == 1 else '✅ Normale'}")

        # Affichage des informations supplémentaires (localisation et comptes)
        print(f"  Localisation     : Latitude {latitude:.4f}, Longitude {longitude:.4f}")
        print(f"  Compte source    : {source_account}, Compte destinataire : {destination_account}\n")

        time.sleep(1.5)

except Exception as e:
    print(f"Erreur pendant l'exécution : {e}")
