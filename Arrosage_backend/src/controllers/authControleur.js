const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');
const config = require('../config/config');
const TokenInvalide = require('../models/TokenInvalide');


// Génération du token JWT
const genererToken = (utilisateur) => {
    return jwt.sign(
        {
            id: utilisateur._id,
            role: utilisateur.role,
            matricule: utilisateur.matricule
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRE }
    );
};

// Connexion avec code
const loginAvecCode = async (req, res) => {
    try {
        const { code } = req.body;
        console.log('1. Code reçu:', code, typeof code);

        // Vérification de la présence du code
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez fournir le code'
            });
        }

        // Vérification du format du code (4 chiffres)
        const codeStr = code.toString();
        console.log('2. Code après conversion:', codeStr, typeof codeStr);
        
        if (!/^\d{4}$/.test(codeStr)) {
            return res.status(400).json({
                success: false,
                message: 'Le code doit être composé de 4 chiffres'
            });
        }

        // Rechercher tous les utilisateurs ayant un code
        const utilisateurs = await Utilisateur.find({ 
            code: { $exists: true }
        }).select('code actif matricule nom prenom email role');

        console.log('3. Nombre d\'utilisateurs avec code:', utilisateurs.length);
        
        // Afficher les détails de chaque utilisateur trouvé
        utilisateurs.forEach((user, index) => {
            console.log(`Utilisateur ${index + 1}:`, {
                matricule: user.matricule,
                role: user.role,
                email:user.email,
                code:user.code,
                actif: user.actif,
                codePresent: !!user.code,
                codeHash: user.code
            });
        });

        // Tester la vérification pour chaque utilisateur
        for (const user of utilisateurs) {
            console.log(`4. Test de vérification pour ${user.matricule}:`);
            const codeValide = await user.verifierCode(codeStr);
            console.log('Résultat:', codeValide);
            
            if (codeValide) {
                // Si le code est valide, procéder à la connexion
                const token = genererToken(user);

                return res.json({
                    success: true,
                    message: 'Connexion réussie',
                    token,
                    utilisateur: {
                        id: user._id,
                        matricule: user.matricule,
                        nom: user.nom,
                        email: user.email,
                        code:user.code,
                        prenom: user.prenom,
                        role: user.role
                    }
                });
            }
        }

        // Si aucun utilisateur n'a été trouvé avec ce code
        return res.status(401).json({
            success: false,
            message: 'Code invalide'
        });

    } catch (error) {
        console.error('Erreur complète:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion'
        });
    }
};

// Connexion avec RFID
const loginAvecRFID = async (req, res) => {
    try {
        const { cardId } = req.body;

        if (!cardId) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez scanner une carte RFID'
            });
        }

        // Rechercher l'utilisateur par cardId
        const utilisateur = await Utilisateur.findOne({ cardId });
        if (!utilisateur) {
            return res.status(401).json({
                success: false,
                message: 'Carte RFID non reconnue'
            });
        }

        // Générer le token
        const token = genererToken(utilisateur);

        res.json({
            success: true,
            message: 'Connexion réussie',
            token,
            utilisateur: {
                id: utilisateur._id,
                matricule: utilisateur.matricule,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                role: utilisateur.role
            }
        });
    } catch (error) {
        console.error('Erreur login avec RFID:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion'
        });
    }
};

// Vérification du token et des informations utilisateur
const verifierAuth = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(req.user.id).select('-code -cardId');
        if (!utilisateur) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            utilisateur
        });
    } catch (error) {
        console.error('Erreur vérification auth:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification de l\'authentification'
        });
    }
};

// Vérifier si une carte RFID est disponible
const verifierRFID = async (req, res) => {
    try {
        const { cardId } = req.body;

        if (!cardId) {
            return res.status(400).json({
                success: false,
                message: 'ID de carte requis'
            });
        }

        const utilisateur = await Utilisateur.findOne({ cardId });
        
        if (utilisateur) {
            return res.status(400).json({
                success: false,
                message: 'Cette carte RFID est déjà assignée',
                utilisateur: {
                    matricule: utilisateur.matricule,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom
                }
            });
        }

        res.json({
            success: true,
            message: 'Carte RFID disponible',
            cardId
        });
    } catch (error) {
        console.error('Erreur vérification RFID:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification de la carte RFID'
        });
    }
};

// Login avec email et password
const loginAvecEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('1. Données reçues:', { email, password });

        // Vérification des champs
        if (!email || !password) {
            console.log('2. Champs manquants');
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis'
            });
        }

        // Rechercher l'utilisateur avec son password explicitement sélectionné
        const utilisateur = await Utilisateur.findOne({ email })
            .select('+password');
        
        console.log('3. Utilisateur trouvé:', !!utilisateur);
        console.log('4. Password hashé en DB:', utilisateur ? utilisateur.password : 'N/A');
        console.log('5. Mot de passe fourni:', password);

        if (!utilisateur) {
            console.log('6. Aucun utilisateur trouvé');
            return res.status(401).json({
                success: false,
                message: 'Identifiants invalides'
            });
        }

        // Vérifier le password
        console.log('7. Tentative de vérification du mot de passe...');
        const passwordValide = await utilisateur.verifierPassword(password);
        console.log('8. Résultat de la vérification:', passwordValide);

        if (!passwordValide) {
            console.log('9. Échec de l\'authentification - mot de passe invalide');
            return res.status(401).json({
                success: false,
                message: 'Identifiants invalides'
            });
        }

        // Générer le token
        const token = genererToken(utilisateur);
        console.log('10. Token généré avec succès');

        res.json({
            success: true,
            message: 'Connexion réussie',
            token,
            utilisateur: {
                id: utilisateur._id,
                matricule: utilisateur.matricule,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                email: utilisateur.email,
                role: utilisateur.role
            }
        });
    } catch (error) {
        console.error('Erreur complète:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion'
        });
    }
};

//deconnexion 
const logout = async (req, res) => {
    try {
        const token = req.token;
        
        // Décoder le token pour obtenir sa date d'expiration
        const decodedToken = jwt.verify(token, config.JWT_SECRET);
        const dateExpiration = new Date(decodedToken.exp * 1000);

        // Ajouter le token à la liste noire
        await TokenInvalide.create({
            token: token,
            dateExpiration: dateExpiration
        });

        res.status(200).json({
            success: true,
            message: 'Déconnexion réussie'
        });
    } catch (error) {
        console.error('Erreur déconnexion:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la déconnexion'
        });
    }
};

// Pour la déconnexion de toutes les sessions
const logoutAll = async (req, res) => {
    try {
        // Récupérer l'ID de l'utilisateur depuis le token
        const userId = req.user._id;

        // Mettre à jour le champ tokenVersion de l'utilisateur
        await Utilisateur.findByIdAndUpdate(userId, {
            $inc: { tokenVersion: 1 }
        });

        res.json({
            success: true,
            message: 'Déconnexion de toutes les sessions réussie'
        });
    } catch (error) {
        console.error('Erreur déconnexion totale:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la déconnexion de toutes les sessions'
        });
    }
};




module.exports = {
    loginAvecCode,
    loginAvecRFID,
    verifierAuth,
    verifierRFID,
    loginAvecEmail,
    logout,
    logoutAll
};