const { SerialPort } = require('serialport'); // Pour gérer la communication série
const { ReadlineParser } = require('@serialport/parser-readline');
const axios = require('axios'); // Pour faire des requêtes HTTP
const WebSocket = require('ws');

// Fonction pour notifier les clients WebSocket
function notifyWebSocketClients(wss, data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}   

// Fonction pour gérer la connexion
async function handleLogin(rfidCardId, wss, port) {
    try {
        // Informer les clients WebSocket d'une carte scannée
        notifyWebSocketClients(wss, { type: 'card', cardID: rfidCardId });

        const response = await axios.post('http://localhost:8002/api/login/rfid', { cardID: rfidCardId });
        if (response.data.message === 'Connexion réussie') {
            console.log('Connexion réussie');
            port.write('Login success\n');
        } else {
            console.log('Connexion échouée');
            port.write('Login failed\n');
        }
    } catch (error) {
        console.error('Erreur lors de la connexion :', error.response?.data?.message || error.message);
        port.write('Login failed\n');
    }
}

// Fonction pour gérer l'attribution de carte
async function handleCardAssignment(rfidCardId, wss, port, selectedUser) {
    try {
        // Informer les clients WebSocket d'une carte scannée
        notifyWebSocketClients(wss, { type: 'card', cardID: rfidCardId });

        if (!selectedUser) {
            console.log('Aucun utilisateur sélectionné pour cette carte.');
            return;
        }

        const payload = {
            cardId: rfidCardId,
        };

        const response = await axios.post(`http://localhost:8002/api/${selectedUser.userId}/rfid`, payload);
        console.log(`Carte attribuée avec succès : ${response.data}`);
        port.write('Card assigned\n');
    } catch (error) {
        console.error('Erreur lors de l\'attribution de la carte :', error.response?.data?.message || error.message);
    }
}

// Fonction pour gérer les données du clavier
function handleKeypadData(key, wss, port) {
    console.log(`Touche pressée : ${key}`);
    notifyWebSocketClients(wss, { type: 'keypad', key });

    if (key === 'A') {
        port.write('Fan ON\n');
    } else if (key === 'B') {
        port.write('Fan OFF\n');
    }
}

// Fonction pour initialiser la communication série avec Arduino
function initSerialPort(path, baudRate, wss) {
    try {
        const port = new SerialPort({ path, baudRate });
        const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

        port.on('error', (err) => {
            console.error('Erreur port série:', err.message);
            // Notifier les clients WebSocket de l'erreur
            notifyWebSocketClients(wss, { 
                type: 'error', 
                source: 'serial',
                message: err.message 
            });
        });

        port.on('open', () => {
            console.log(`Port série ${path} ouvert avec succès`);
        });

        // Reste du code...

        return port;
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du port série:', error);
        throw error;
    }
}
module.exports = {
    initSerialPort,
    handleLogin,
    handleCardAssignment,
};