const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

class KeypadService {
    constructor() {
        this.serialPort = null;
        this.parser = null;
        this.wss = null;
    }

    initKeypad(wss) {
        this.wss = wss;
        try {
            this.serialPort = new SerialPort({
                path: '/dev/ttyUSB0',
                baudRate: 9600,
            });

            this.parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

            this.parser.on('data', (data) => {
                const value = data.trim();
                // Ne traiter que les données du keypad (à adapter selon votre format)
                if (!value.startsWith('RFID:')) {
                    console.log('Touche keypad reçue:', value);
                    this.broadcastToClients(value);
                }
            });

            this.serialPort.on('error', (err) => {
                console.error('Erreur du port série Keypad:', err.message);
            });

            // Configuration des événements WebSocket
            this.wss.on('connection', (ws) => {
                console.log('Client Keypad connecté');
                ws.send(JSON.stringify({ message: 'Connexion Keypad établie' }));

                ws.on('close', () => {
                    console.log('Client Keypad déconnecté');
                });
            });

        } catch (error) {
            console.error('Erreur lors de l\'initialisation du Keypad:', error.message);
        }
    }

    broadcastToClients(value) {
        if (this.wss) {
            this.wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'keypad', value }));
                }
            });
        }
    }

    arreterService() {
        if (this.serialPort) {
            this.serialPort.close();
            console.log('Port série Keypad fermé');
        }
    }
}

module.exports = new KeypadService();