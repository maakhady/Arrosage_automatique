const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const utilisateurSchema = new mongoose.Schema({
    prenom: {
        type: String,
        required: true
    },
    nom: {
        type: String,
        required: true
    },
    matricule: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function(v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: 'Email invalide'
        }
    },
    password: {
        type: String,
        select: false,
        validate: {
            validator: function(v) {
                if (this.email && !v) return false;
                if (v && v.length < 6) return false;
                return true;
            },
            message: 'Le mot de passe doit contenir au moins 6 caractères'
        }
    },
    cardId: {
        type: String,
        unique: true,
        sparse: true
    },
    code: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function(v) {
                return /^\d{4}$/.test(v.toString());
            },
            message: 'Le code doit être composé de 4 chiffres'
        }
    },
    role: {
        type: String,
        enum: ['super-admin', 'utilisateur'],
        default: 'utilisateur'
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

// Middleware pour gérer la matricule, le code 
utilisateurSchema.pre('save', async function(next) {
    try {
        if (this.isNew) {
            // Génération de la matricule
            const generateMatricule = async () => {
                const nombreAleatoire = Math.floor(1000 + Math.random() * 9000);
                return `NAAT${nombreAleatoire}`;
            };

            // Génération du code
            const generateCode = async () => {
                return Math.floor(1000 + Math.random() * 9000).toString();
            };

            // Génération matricule unique
            let matriculeUnique = false;
            let tentatives = 0;
            const maxTentatives = 50;

            while (!matriculeUnique && tentatives < maxTentatives) {
                const matriculeCandidat = await generateMatricule();
                const utilisateurExistant = await this.constructor.findOne({ matricule: matriculeCandidat });
                
                if (!utilisateurExistant) {
                    this.matricule = matriculeCandidat;
                    matriculeUnique = true;
                }
                tentatives++;
            }

            if (!matriculeUnique) {
                throw new Error('Impossible de générer une matricule unique après plusieurs tentatives');
            }

            // Génération code unique
            let codeUnique = false;
            tentatives = 0;

            while (!codeUnique && tentatives < maxTentatives) {
                const codeCandidat = await generateCode();
                const utilisateurExistant = await this.constructor.findOne({ code: codeCandidat });
                
                if (!utilisateurExistant) {
                    this.code = codeCandidat;
                    codeUnique = true;
                }
                tentatives++;
            }

            if (!codeUnique) {
                throw new Error('Impossible de générer un code unique après plusieurs tentatives');
            }
        }

        // Hashage du password uniquement si modifié et présent
        if (this.isModified('password') && this.password) {
            this.password = await bcrypt.hash(this.password, 10);
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Méthodes de vérification
utilisateurSchema.methods.verifierPassword = async function(password) {
    try {
        const utilisateur = await this.constructor.findById(this._id).select('+password');
        if (!utilisateur || !utilisateur.password) return false;
        return await bcrypt.compare(password, utilisateur.password);
    } catch (error) {
        return false;
    }
};

utilisateurSchema.methods.verifierCode = async function(code) {
    try {
        const utilisateur = await this.constructor.findById(this._id).select('+code');
        if (!utilisateur || !utilisateur.code) return false;
        return code.toString() === utilisateur.code;  // Comparaison directe sans bcrypt
    } catch (error) {
        return false;
    }
};

module.exports = mongoose.model('Utilisateur', utilisateurSchema);