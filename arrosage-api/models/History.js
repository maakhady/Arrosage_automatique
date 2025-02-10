// models/History.js
const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  heure: { type: String, required: true },
  duree: { type: String, required: true },
  type: { type: String, required: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true }
});

const History = mongoose.model('historiquearrosages', historySchema);

module.exports = History;
