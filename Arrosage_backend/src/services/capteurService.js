const axios = require('axios');
const WebSocket = require('ws'); // Importez le module WebSocket
const RASPBERRY_URL = 'http://192.168.1.24:5000/api/capteurs';
let interval = null;
let wss = null;

const capteurService = {
    demarrerLecture: (webSocketServer) => {
        wss = webSocketServer;
        interval = setInterval(async () => {
            try {
                const response = await axios.get(RASPBERRY_URL);
                console.log('Données capteurs:', response.data);
                // Émettre les données via WebSockets
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(response.data));
                    }
                });
                // Stockez ou traitez les données selon vos besoins
            } catch (error) {
                console.error('Erreur lecture capteurs:', error);
            }
        }, 1000);
    },

    arreterLecture: () => {
        if (interval) {
            clearInterval(interval);
        }
    },

    getDerniereLecture: async () => {
        try {
            const response = await axios.get(RASPBERRY_URL);
            return response.data;
        } catch (error) {
            console.error('Erreur:', error);
            return { humidite: null, lumiere: null, niveau_eau: null
            };
        }
    }
};

module.exports = capteurService;
