from flask import Flask, jsonify, request
from flask_cors import CORS
import serial
from functools import wraps
from datetime import datetime
import threading
import time
import requests

app = Flask(__name__)
CORS(app)

# Configuration
NODEJS_URL = 'http://localhost:3000'

try:
    ser = serial.Serial('/dev/ttyUSB1', 9600)
except Exception as e:
    print(f"Erreur d'initialisation du port série: {e}")

# Décorateur pour l'authentification
def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({
                'success': False,
                'message': 'Token d\'authentification manquant'
            }), 401
        # Ici vous pouvez ajouter votre logique de vérification du token
        return f(*args, **kwargs)
    return decorated

@app.route('/api/capteurs')
def get_donnees():
    try:
        if ser.in_waiting:
            data = ser.readline().decode('utf-8').strip().split(',')
            humidite, lumiere, niveau_eau, etat_pompe, mode = data
            return jsonify({
                'humidite': int(humidite),
                'lumiere': int(lumiere),
                'niveau_eau': int(niveau_eau),
                'etat_pompe': int(etat_pompe),
                'mode': mode
            })
        else:
            return jsonify({
                'humidite': 0,
                'lumiere': 0,
                'niveau_eau': 0,
                'etat_pompe': 0,
                'mode': 'AUTO',
                'status': 'no_data'
            })
    except Exception as e:
        print(f"Erreur: {e}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/api/arrosage/manuel/global', methods=['POST'])
@auth_required
def arrosage_manuel_global():
    try:
        print("Commande d'arrosage manuel reçue")
        ser.write("ON\n".encode())
        ser.flush()
        print("Commande ON envoyée à l'Arduino")
        
        return jsonify({
            'success': True,
            'message': 'Arrosage manuel global déclenché avec succès',
            'nombrePlantes': 1,
            'resultats': [{
                'plante': {
                    'id': 1,
                    'nom': 'Plante'
                },
                'arrosage': {
                    'type': 'manuel',
                    'actif': True
                }
            }]
        })
    except Exception as e:
        print(f"Erreur arrosage manuel global:", e)
        return jsonify({
            'success': False,
            'message': 'Erreur lors de l\'arrosage manuel global',
            'details': str(e)
        }), 500

@app.route('/api/arrosage/stop', methods=['POST'])
@auth_required
def arreter_arrosage():
    try:
        print("Commande d'arrêt reçue")
        ser.write("OFF\n".encode())
        ser.flush()
        print("Commande OFF envoyée à l'Arduino")
        
        return jsonify({
            'success': True,
            'message': 'Arrosage arrêté avec succès'
        })
    except Exception as e:
        print(f"Erreur arrêt arrosage:", e)
        return jsonify({
            'success': False,
            'message': 'Erreur lors de l\'arrêt de l\'arrosage'
        }), 500

def check_scheduled_arrosages():
    while True:
        try:
            now = datetime.now()
            print(f"Vérification des arrosages programmés à {now.strftime('%H:%M:%S')}")
            
            # Appel à l'API Node.js
            response = requests.get(f'{NODEJS_URL}/api/arrosage/scheduled')
            if response.status_code == 200:
                data = response.json()
                
                # Vérifier s'il y a des arrosages à démarrer
                if data.get('arrosagesADemarrer', []):
                    print("Démarrage d'arrosages programmés")
                    ser.write("ON\n".encode())
                    ser.flush()
                
                # Vérifier s'il y a des arrosages à arrêter
                if data.get('arrosagesAArreter', []):
                    print("Arrêt d'arrosages programmés")
                    ser.write("OFF\n".encode())
                    ser.flush()
            
        except Exception as e:
            print(f"Erreur lors de la vérification des arrosages programmés: {e}")
        
        time.sleep(30)  # Vérification toutes les 30 secondes

# Démarrer le thread de vérification
scheduler_thread = threading.Thread(target=check_scheduled_arrosages)
scheduler_thread.daemon = True
scheduler_thread.start()

if __name__ == '__main__':
    print("Démarrage du serveur d'arrosage")
    app.run(host='0.0.0.0', port=5000, debug=True)
