from flask import Flask, jsonify, request
from flask_cors import CORS
import serial
from functools import wraps

app = Flask(__name__)
CORS(app)

try:
    ser = serial.Serial('/dev/ttyUSB0', 9600)
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
        # Envoie la commande ON à l'Arduino
        ser.write("ON\n".encode())
        ser.flush()  # S'assure que la commande est envoyée
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
        # Envoie la commande OFF à l'Arduino
        ser.write("OFF\n".encode())
        ser.flush()  # S'assure que la commande est envoyée
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
