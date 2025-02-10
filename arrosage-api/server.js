// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const History = require('./models/History');

const app = express();

// Middleware
app.use(cors()); // Permet de gérer les requêtes depuis un autre domaine
app.use(express.json()); // Pour analyser les données en JSON

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/arrosage-intelligent', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Base de données connectée'))
  .catch((err) => console.log('Erreur de connexion à MongoDB:', err));

// Route pour récupérer l'historique
app.get('/api/historique', async (req, res) => {
  try {
    const historique = await History.find(); // Récupérer tous les documents dans la collection 'History'
    res.json(historique); // Retourner les données au client
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique', error: err });
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
