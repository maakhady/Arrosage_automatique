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

// Middlewares
app.use(helmet()); // Sécurité
app.use(cors()); // Gestion des CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parser JSON
app.use(express.urlencoded({ extended: true })); // Parser URL-encoded
app.use(fileUpload()); // Gestion des fichiers uploadés

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