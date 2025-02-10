const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const http = require('http');
const WebSocket = require('ws');
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
const wss = new WebSocket.Server({ server }); // WebSocket pour les capteurs
const wssRFID = new WebSocket.Server({ port: 3004 }); // WebSocket dédié pour RFID

// Connexion à la base de données
connecterBaseDeDonnees();

// Démarrage des services
capteurService.demarrerLecture(wss);
rfidService.initSerialPort('/dev/ttyUSB0', 9600, wssRFID);

// Middleware
app.use(cors({
    origin: ['http://localhost:4200', 'http://192.168.1.24:5000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/plantes', planteRoutes);
app.use('/api/arrosage', arrosageRoutes);
app.use('/api/historique', historiqueArrosageRoutes);
app.use('/api/capteurs', capteurRoutes);

const startScheduler = require('./scheduler');

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
    console.log(`Serveur HTTP et WebSocket capteurs démarré sur le port ${PORT}`);
    console.log(`Serveur WebSocket RFID démarré sur le port 3004`);
});

// Gestion de l'arrêt
process.on('SIGTERM', () => {
    console.log('SIGTERM reçu. Fermeture des serveurs...');
    capteurService.arreterLecture();
    wssRFID.close(() => {
        console.log('Serveur WebSocket RFID fermé');
    });
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT reçu. Fermeture des serveurs...');
    capteurService.arreterLecture();
    wssRFID.close(() => {
        console.log('Serveur WebSocket RFID fermé');
    });
    process.exit(0);
});

// Démarrage du scheduler
startScheduler();

module.exports = app;