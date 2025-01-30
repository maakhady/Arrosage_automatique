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
 
 // Middleware pour gérer la matricule et le hashage
 utilisateurSchema.pre('save', async function(next) {
    try {
        // Génération de la matricule pour un nouvel utilisateur
        if (this.isNew) {
            const generateMatricule = async () => {
                const nombreAleatoire = Math.floor(1000 + Math.random() * 9000);
                return `NAAT${nombreAleatoire}`;
            };
 
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
        }
 
        // Hashage du password si modifié et présent
        if (this.isModified('password') && this.password) {
            this.password = await bcrypt.hash(this.password, 10);
        }
 
        // Hashage du code si modifié et présent
        if (this.isModified('code') && this.code) {
            this.code = await bcrypt.hash(this.code.toString(), 10);
        }
 
        next();
    } catch (error) {
        next(error);
    }
 });
 
 // Méthodes de vérification
 utilisateurSchema.methods.verifierPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
 };
 
 utilisateurSchema.methods.verifierCode = async function(code) {
    return await bcrypt.compare(code.toString(), this.code);
 };
 
 module.exports = mongoose.model('Utilisateur', utilisateurSchema);