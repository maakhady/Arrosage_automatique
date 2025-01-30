const mongoose = require('mongoose');

const planteSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    categorie: {
        type: String,
        required: true
    },
    humiditeSol: {
        type: Number,
        required: true
    },
    volumeEau: {
        type: Number,
        required: true
    },
    luminosite: {
        type: Number,
        required: true
    },
    date_creation: {
        type: Date,
        default: Date.now
    },
    date_modification: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Plante', planteSchema);