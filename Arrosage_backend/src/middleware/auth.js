const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Utilisateur = require('../models/Utilisateur');
const TokenInvalide = require('../models/TokenInvalide');


const auth = async (req, res, next) => {
    try {
        // Récupérer le token du header Authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }

        try {
             // Vérifier si le token est dans la liste noire
             const tokenInvalide = await TokenInvalide.findOne({ token });
             if (tokenInvalide) {
                 throw new Error('Token invalide');
             }

            // Vérifier le token
            const decoded = jwt.verify(token, config.JWT_SECRET);

            // Vérifier si l'utilisateur existe toujours
            const utilisateur = await Utilisateur.findById(decoded.id);

            if (!utilisateur) {
                throw new Error();
            }

            // Vérifier si le tokenVersion correspond
            if (decoded.version !== utilisateur.tokenVersion) {
                throw new Error('Session expirée');
            }

            // Vérifier si l'utilisateur est actif
            if (!utilisateur.actif) {
                return res.status(401).json({
                    success: false,
                    message: 'Ce compte a été désactivé. Veuillez contacter un administrateur.'
                });
            }

            // Ajouter l'utilisateur à la requête
            req.user = utilisateur;
            req.token = token;
            
            next();
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Session invalide ou expiré'
            });
        }
    } catch (error) {
        console.error('Erreur middleware auth:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'authentification'
        });
    }
};

module.exports = auth;