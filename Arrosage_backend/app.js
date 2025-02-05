const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
require('dotenv').config();

// Import de la connexion à la base de données
const connecterBaseDeDonnees = require('./src/config/database');

// Import des routes
const authRoutes = require('./src/routes/authRoutes');
const utilisateurRoutes = require('./src/routes/utilisateurRoutes');
const planteRoutes = require('./src/routes/planteRoutes');
const arrosageRoutes = require('./src/routes/arrosageRoutes');
const historiqueArrosageRoutes = require('./src/routes/historiqueArrosageRoutes');

// Création de l'application Express
const app = express();

// Connexion à la base de données
connecterBaseDeDonnees();

// Configuration CORS
app.use(cors({
 origin: 'http://localhost:4200',
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

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Middleware de logging des requêtes
app.use((req, res, next) => {
 console.log('Request Headers:', req.headers);
 console.log('Request Method:', req.method);
 console.log('Request URL:', req.url);
 next();
});

// Routes de base
app.get('/', (req, res) => {
   res.json({
       message: 'Bienvenue sur l\'API du système d\'arrosage intelligent'
   });
});

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/plantes', planteRoutes);
app.use('/api/arrosage', arrosageRoutes);
app.use('/api/historique', historiqueArrosageRoutes);

// Gestion des erreurs 404
app.use((req, res, next) => {
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

// Port d'écoute
const PORT = process.env.PORT || 3000;

// Démarrage du serveur
app.listen(PORT, () => {
   console.log(`Serveur démarré sur le port ${PORT}`);
});

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
   console.log('SIGTERM reçu. Fermeture du serveur...');
   process.exit(0);
});

process.on('SIGINT', () => {
   console.log('SIGINT reçu. Fermeture du serveur...');
   process.exit(0);
});

module.exports = app;