const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const http = require('http');
const WebSocket = require('ws'); // Importez le module WebSocket
require('dotenv').config();


// Import des services
const capteurService = require('./src/services/capteurService');

// Import de la connexion à la base de données
const connecterBaseDeDonnees = require('./src/config/database');

// Import des routes
const authRoutes = require('./src/routes/authRoutes');
const utilisateurRoutes = require('./src/routes/utilisateurRoutes');
const planteRoutes = require('./src/routes/planteRoutes');
const arrosageRoutes = require('./src/routes/arrosageRoutes');
const historiqueArrosageRoutes = require('./src/routes/historiqueArrosageRoutes');
const capteurRoutes = require('./src/routes/capteurRoutes');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

connecterBaseDeDonnees();

// Démarrage du service de capteurs
capteurService.demarrerLecture(wss);

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/plantes', planteRoutes);
app.use('/api/arrosage', arrosageRoutes);
app.use('/api/historique', historiqueArrosageRoutes);
app.use('/api/capteurs', capteurRoutes);

const startScheduler = require('./scheduler');


// Gestion des erreurs
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

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
    console.log(`Serveur démarré sur le port ${PORT}`);
});

// Gestion de l'arrêt
process.on('SIGTERM', () => {
    capteurService.arreterLecture();
    process.exit(0);
});

process.on('SIGINT', () => {
    capteurService.arreterLecture();
    process.exit(0);
});

// Démarrez le scheduler après avoir configuré votre app Express
startScheduler();


module.exports = app;
