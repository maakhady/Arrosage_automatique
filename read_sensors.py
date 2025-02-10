from flask import Flask, jsonify
from flask_cors import CORS
import serial

app = Flask(__name__)
CORS(app)
ser = serial.Serial('/dev/ttyUSB0', 9600)

@app.route('/api/capteurs')
def get_donnees():
   try:
       if ser.in_waiting:
           data = ser.readline().decode('utf-8').strip().split(',')
           humidite, lumiere, niveau_eau = map(int, data)
           return jsonify({
               'humidite': humidite,
               'lumiere': lumiere,
               'niveau_eau': niveau_eau
           })
       else:
           # Retourner une réponse par défaut si pas de données disponibles
           return jsonify({
               'humidite': 0,
               'lumiere': 0,
               'niveau_eau': 0,
               'status': 'no_data'
           })
   except Exception as e:
       print(f"Erreur: {e}")
       return jsonify({
           'error': str(e),
           'humidite': 0,
           'lumiere': 0,
           'niveau_eau': 0,
           'status': 'error'
       }), 500

if __name__ == '__main__':
   app.run(host='0.0.0.0', port=5000)