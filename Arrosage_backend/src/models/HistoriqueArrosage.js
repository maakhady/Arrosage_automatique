const mongoose = require('mongoose');

const historiqueArrosageSchema = new mongoose.Schema({
    plante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plante',
        required: true
    },
    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['manuel', 'automatique'],
        required: true
    },
    volumeEau: {
        type: Number,
        required: true
    },
    humiditeSol: {
        type: Number,
        required: false
    },
    luminosite: {
        type: Number,
        required: false
    },
    parametreUtilise: {
        type: String,
        required: true
    },
    id_arrosage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Arrosage',
        required: true
    }
});

module.exports = mongoose.model('HistoriqueArrosage', historiqueArrosageSchema);