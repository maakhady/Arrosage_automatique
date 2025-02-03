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
    id_arrosage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Arrosage',
        required: true
    },
    type: {
        type: String,
        enum: ['manuel', 'automatique'],
        required: true
    },
    heureDebut: {
        heures: {
            type: Number,
            min: 0,
            max: 23,
            required: true
        },
        minutes: {
            type: Number,
            min: 0,
            max: 59,
            required: true
        },
        secondes: {
            type: Number,
            min: 0,
            max: 59,
            required: true
        }
    },
    heureFin: {
        heures: {
            type: Number,
            min: 0,
            max: 23,
            required: true
        },
        minutes: {
            type: Number,
            min: 0,
            max: 59,
            required: true
        },
        secondes: {
            type: Number,
            min: 0,
            max: 59,
            required: true
        }
    },
    volumeEau: {
        type: Number,
        required: true,
        min: 0
    },
    parametresArrosage: {
        humiditeSolRequise: Number,
        luminositeRequise: Number,
        volumeEau: Number
    },
    actif: {
        type: Boolean,
        default: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('HistoriqueArrosage', historiqueArrosageSchema);