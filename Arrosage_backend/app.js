const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const http = require('http');
const WebSocket = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
require('dotenv').config();

// Import des services
const capteurService = require('./src/services/capteurService');
const rfidService = require('./src/services/rfidService');

// Import de la connexion à la base de données
const connecterBaseDeDonnees = require('./src/config/database');

// Import des routes
const authRoutes = require('./src/routes/authRoutes');
const utilisateurRoutes = require('./src/routes/utilisateurRoutes');
const planteRoutes = require('./src/routes/planteRoutes');
const arrosageRoutes = require('./src/routes/arrosageRoutes');
const historiqueArrosageRoutes = require('./src/routes/historiqueArrosageRoutes');
const capteurRoutes = require('./src/routes/capteurRoutes');

// Création de l'application et des serveurs
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // WebSocket principal
const wssKeypad = new WebSocket.Server({ port: 8001 }); // WebSocket pour le keypad
const wssRFID = new WebSocket.Server({ port: 3004 }); // WebSocket pour RFID

// Connexion à la base de données
connecterBaseDeDonnees();

// Configuration du port série
let serialPort;
let parser;

try {
    serialPort = new SerialPort({
        path: '/dev/ttyUSB0',
        baudRate: 9600,
    });

    parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    parser.on('data', (data) => {
        let value = data.trim();
        console.log('Donnée reçue:', value);
        
        // Si c'est un code RFID (commence par "UID:")
        if (value.startsWith('UID:')) {
            wssRFID.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ 
                        type: 'rfid', 
                        value: value.replace('UID:', '').trim() 
                    }));
                }
            });
        } 
        // Sinon c'est une touche du keypad (un seul caractère)
        else if (value.length === 1) {
            console.log('Envoi de touche keypad:', value);
            wssKeypad.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ 
                        type: 'keypad', 
                        value: value 
                    }));
                    console.log('Message keypad envoyé:', JSON.stringify({ type: 'keypad', value: value }));
                }
            });
        }
    });

    serialPort.on('error', (err) => {
        console.error('Erreur du port série:', err.message);
    });

    serialPort.on('open', () => {
        console.log('Port série ouvert sur /dev/ttyUSB0');
    });

} catch (error) {
    console.error('Erreur lors de la configuration du port série:', error.message);
}

// Configuration des WebSockets
wssKeypad.on('connection', (ws) => {
    console.log('Client Keypad connecté');
    ws.send(JSON.stringify({ message: 'Connexion Keypad établie' }));

    ws.on('close', () => {
        console.log('Client Keypad déconnecté');
    });
});

wssRFID.on('connection', (ws) => {
    console.log('Client RFID connecté');
    ws.send(JSON.stringify({ message: 'Connexion RFID établie' }));

    ws.on('close', () => {
        console.log('Client RFID déconnecté');
    });
});

// Démarrage des services
capteurService.demarrerLecture(wss);

// Configuration CORS
app.use(cors({
    origin: ['http://localhost:4200', 'http://192.168.1.24:5000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Configuration Helmet
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

// Middleware de base
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Route racine
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenue sur l\'API du système d\'arrosage intelligent'
    });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/plantes', planteRoutes);
app.use('/api/arrosage', arrosageRoutes);
app.use('/api/historique', historiqueArrosageRoutes);
app.use('/api/capteurs', capteurRoutes);

// Import et démarrage du scheduler
const startScheduler = require('./scheduler');
startScheduler();

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur HTTP et WebSocket principal démarré sur le port ${PORT}`);
    console.log('WebSocket Keypad en écoute sur ws://localhost:8001');
    console.log('WebSocket RFID en écoute sur ws://localhost:3004');
});

// Gestion gracieuse de l'arrêt
const gracefulShutdown = () => {
    console.log('Fermeture des serveurs...');
    
    if (serialPort) {
        serialPort.close();
        console.log('Port série fermé');
    }
    
    capteurService.arreterLecture();
    
    wssKeypad.close(() => {
        console.log('Serveur WebSocket Keypad fermé');
    });
    
    wssRFID.close(() => {
        console.log('Serveur WebSocket RFID fermé');
    });
    
    process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;