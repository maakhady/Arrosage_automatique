const mongoose = require('mongoose');

const arrosageSchema = new mongoose.Schema({
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
        required: true
    },
    actif: {
        type: Boolean,
        default: true
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

// Validation pour s'assurer que heureFin est après heureDebut
arrosageSchema.pre('save', function(next) {
    const debutEnSecondes = (this.heureDebut.heures * 3600) + 
                           (this.heureDebut.minutes * 60) + 
                           this.heureDebut.secondes;

    const finEnSecondes = (this.heureFin.heures * 3600) + 
                         (this.heureFin.minutes * 60) + 
                         this.heureFin.secondes;

    if (finEnSecondes <= debutEnSecondes) {
        return next(new Error('L\'heure de fin doit être après l\'heure de début'));
    }
    next();
});

module.exports = mongoose.model('Arrosage', arrosageSchema);