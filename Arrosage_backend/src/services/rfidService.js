const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const axios = require('axios');
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
        notifyWebSocketClients(wss, { type: 'card', cardID: rfidCardId });
        if (!selectedUser) {
            console.log('Aucun utilisateur sélectionné pour cette carte.');
            return;
        }
        const payload = { cardId: rfidCardId };
        const response = await axios.post(`http://localhost:8002/api/${selectedUser.userId}/rfid`, payload);
        console.log(`Carte attribuée avec succès : ${response.data}`);
        port.write('Card assigned\n');
    } catch (error) {
        console.error('Erreur lors de l\'attribution de la carte :', error.response?.data?.message || error.message);
    }
}

// Fonction pour initialiser la communication série avec Arduino
function initSerialPort(path, baudRate, wss) {
    const port = new SerialPort({ path, baudRate });
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
    let currentMode = null;

    port.on('error', (err) => {
        console.error('Erreur de port série :', err.message);
        notifyWebSocketClients(wss, { type: 'error', message: 'Erreur de connexion série' });
    });

    parser.on('data', async (data) => {
        const trimmedData = data.trim();
        if (trimmedData.startsWith('UID:')) {
            const rfidCardId = trimmedData.toUpperCase();
            console.log(`Carte RFID lue : ${rfidCardId}`);
            notifyWebSocketClients(wss, { type: 'rfid-scan', cardID: rfidCardId });
            if (currentMode === 'login') {
                await handleLogin(rfidCardId, wss, port);
            } else {
                await handleCardAssignment(rfidCardId, wss, port, null);
            }
        }
    });

    return port;
}

module.exports = {
    initSerialPort,
    handleLogin,
    handleCardAssignment,
};
