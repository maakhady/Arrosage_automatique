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
    parametresArrosage: {
        humiditeSolRequise: {
            type: Number,
            required: function() {
                return this.type === 'automatique';
            }
        },
        volumeEau: {
            type: Number,
            required: true
        },
        luminositeRequise: {
            type: Number,
            required: function() {
                return this.type === 'automatique';
            }
        }
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

    // Validation des paramètres d'arrosage automatique
    if (this.type === 'automatique') {
        if (!this.parametresArrosage.humiditeSolRequise || 
            !this.parametresArrosage.luminositeRequise) {
            return next(new Error('Les paramètres d\'arrosage automatique sont requis'));
        }
    }

    next();
});

// Middleware pour vérifier la cohérence avec la plante
arrosageSchema.pre('save', async function(next) {
    try {
        const Plante = mongoose.model('Plante');
        const plante = await Plante.findById(this.plante);
        
        if (!plante) {
            return next(new Error('Plante non trouvée'));
        }

        // Vérifier que les paramètres d'arrosage sont cohérents avec la plante
        if (this.type === 'automatique') {
            if (this.parametresArrosage.humiditeSolRequise < plante.humiditeSol) {
                return next(new Error('L\'humidité requise ne peut pas être inférieure à l\'humidité minimale de la plante'));
            }
            
            if (this.parametresArrosage.volumeEau > plante.volumeEau) {
                return next(new Error('Le volume d\'eau ne peut pas dépasser le volume maximal de la plante'));
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Arrosage', arrosageSchema);