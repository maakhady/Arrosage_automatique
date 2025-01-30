const mongoose = require('mongoose');
const config = require('./config');

const connecterBaseDeDonnees = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connexion à MongoDB établie avec succès');
    } catch (error) {
        console.error('Erreur de connexion MongoDB:', error);
        process.exit(1);
    }
};

// Gestion des événements de la base de données
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB déconnecté');
});

mongoose.connection.on('error', (erreur) => {
    console.error('Erreur MongoDB:', erreur);
});

// Gestion de la fermeture propre de la connexion
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
        process.exit(0);
    } catch (erreur) {
        console.error('Erreur lors de la fermeture de la connexion MongoDB:', erreur);
        process.exit(1);
    }
});

module.exports = connecterBaseDeDonnees;