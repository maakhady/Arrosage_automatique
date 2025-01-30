const mongoose = require('mongoose');

const tokenInvalideSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    dateExpiration: {
        type: Date,
        required: true,
        expires: 0 // Utilise MongoDB TTL pour supprimer automatiquement les documents expirés
    }
});

module.exports = mongoose.model('TokenInvalide', tokenInvalideSchema);