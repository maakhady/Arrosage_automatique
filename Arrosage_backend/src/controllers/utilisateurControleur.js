const Utilisateur = require('../models/Utilisateur');
const Papa = require('papaparse');

// Créer un nouvel utilisateur (super-admin uniquement)
const creerUtilisateur = async (req, res) => {
    try {
        const { prenom, nom, code, email, password, role } = req.body;
        console.log('1. Données reçues:', { prenom, nom, code, email, password: '***', role });

        // Générer une matricule unique
        const generateMatricule = async () => {
            let matriculeUnique = false;
            let matricule;
            let tentatives = 0;
            const maxTentatives = 50;

            while (!matriculeUnique && tentatives < maxTentatives) {
                const nombreAleatoire = Math.floor(1000 + Math.random() * 9000);
                matricule = `NAAT${nombreAleatoire}`;

                const utilisateurExistant = await Utilisateur.findOne({ matricule });
                if (!utilisateurExistant) {
                    matriculeUnique = true;
                }
                tentatives++;
            }

            if (!matriculeUnique) {
                throw new Error('Impossible de générer une matricule unique après plusieurs tentatives');
            }

            return matricule;
        };

        // Générer un code unique si non fourni
        const generateCode = async () => {
            let codeUnique = false;
            let code;
            let tentatives = 0;
            const maxTentatives = 50;

            while (!codeUnique && tentatives < maxTentatives) {
                code = Math.floor(1000 + Math.random() * 9000).toString();

                const utilisateurExistant = await Utilisateur.findOne({ code });
                if (!utilisateurExistant) {
                    codeUnique = true;
                }
                tentatives++;
            }

            if (!codeUnique) {
                throw new Error('Impossible de générer un code unique après plusieurs tentatives');
            }

            return code;
        };

        const matricule = await generateMatricule();
        const generatedCode = code ? code : await generateCode();
        console.log('2. Matricule générée:', matricule);
        console.log('3. Code généré:', generatedCode);

        // Vérifications...
        if (!prenom || !nom) {
            return res.status(400).json({
                success: false,
                message: 'Prénom et nom sont requis'
            });
        }

        if (!generatedCode && !email) {
            return res.status(400).json({
                success: false,
                message: 'Au moins une méthode d\'authentification est requise (code ou email)'
            });
        }

        if (generatedCode && !/^\d{4}$/.test(generatedCode.toString())) {
            return res.status(400).json({
                success: false,
                message: 'Le code doit être composé de 4 chiffres'
            });
        }

        console.log('4. Création de l\'utilisateur...');
        const nouvelUtilisateur = new Utilisateur({
            matricule,  // Ajout de la matricule générée
            prenom,
            nom,
            code: generatedCode,  // Ajout du code généré
            email,
            password,
            role: role || 'utilisateur'
        });

        console.log('5. Tentative de sauvegarde...');
        await nouvelUtilisateur.save();
        console.log('6. Sauvegarde réussie');

        const utilisateurResponse = nouvelUtilisateur.toObject();
        delete utilisateurResponse.password;

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            utilisateur: utilisateurResponse
        });
    } catch (error) {
        console.error('Erreur détaillée création utilisateur:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur existe déjà avec ces informations'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'utilisateur'
        });
    }
};


// Récupérer tous les utilisateurs (super-admin uniquement)
const getTousUtilisateurs = async (req, res) => {
    try {
        const utilisateurs = await Utilisateur.find()
            .select('-code -cardId')
            .sort({ date_creation: -1 });

        res.json({
            success: true,
            utilisateurs
        });
    } catch (error) {
        console.error('Erreur récupération utilisateurs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs'
        });
    }
};

// Récupérer un utilisateur par ID (super-admin uniquement)
const getUtilisateurParId = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(req.params.id)
            .select('-code -cardId');

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
        console.error('Erreur récupération utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'utilisateur'
        });
    }
};

// Modifier un utilisateur (super-admin uniquement)
const modifierUtilisateur = async (req, res) => {
    try {
        const { prenom, nom, code, role, email } = req.body;

        // Préparation des champs à mettre à jour
        const updateFields = {};
        if (prenom) updateFields.prenom = prenom;
        if (nom) updateFields.nom = nom;
        if (role) updateFields.role = role;
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Format d\'email invalide'
                });
            }
            updateFields.email = email;
        }

        // Vérification du code si fourni
        if (code !== undefined) {
            if (!/^\d{4}$/.test(code.toString())) {
                return res.status(400).json({
                    success: false,
                    message: 'Le code doit être composé de 4 chiffres'
                });
            }
            updateFields.code = code.toString();
        }

        updateFields.date_modification = Date.now();

        // Mise à jour directe sans passer par save()
        const utilisateurMisAJour = await Utilisateur.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            {
                new: true,
                runValidators: false, // Désactive les validateurs
                select: '-code -cardId'
            }
        );

        if (!utilisateurMisAJour) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Utilisateur modifié avec succès',
            utilisateur: utilisateurMisAJour
        });

    } catch (error) {
        console.error('Erreur modification utilisateur:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                erreurs: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de l\'utilisateur'
        });
    }
};

// Supprimer un ou plusieurs utilisateurs (super-admin uniquement)
const supprimerUtilisateur = async (req, res) => {
    try {
        // Vérifier si on reçoit un tableau d'IDs ou un ID unique
        const { ids } = req.body;
        const idUnique = req.params.id;

        // Suppression multiple
        if (ids && Array.isArray(ids)) {
            // Vérifier qu'on ne supprime pas le super-admin connecté
            if (ids.includes(req.user._id.toString())) {
                return res.status(400).json({
                    success: false,
                    message: 'Vous ne pouvez pas supprimer votre propre compte'
                });
            }

            const resultat = await Utilisateur.deleteMany({
                _id: { $in: ids }
            });

            if (resultat.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Aucun utilisateur n\'a été supprimé'
                });
            }

            return res.json({
                success: true,
                message: `${resultat.deletedCount} utilisateur(s) supprimé(s) avec succès`
            });
        }

        // Suppression unique
        if (idUnique) {
            // Vérifier qu'on ne supprime pas son propre compte
            if (idUnique === req.user._id.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Vous ne pouvez pas supprimer votre propre compte'
                });
            }

            const utilisateur = await Utilisateur.findById(idUnique);

            if (!utilisateur) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            const utilisateurSupprime = await Utilisateur.findByIdAndDelete(idUnique);

            if (!utilisateurSupprime) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            return res.json({
                success: true,
                message: 'Utilisateur supprimé avec succès'
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Veuillez fournir un ID ou un tableau d\'IDs à supprimer'
        });

    } catch (error) {
        console.error('Erreur suppression utilisateur(s):', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de(s) utilisateur(s)'
        });
    }
};


// Assigner une carte RFID à un utilisateur (super-admin uniquement)
const assignerCarteRFID = async (req, res) => {
    try {
        const { cardId } = req.body;
        const utilisateurId = req.params.id;

        // Vérifier si la carte est déjà assignée à un autre utilisateur
        const utilisateurExistant = await Utilisateur.findOne({ cardId });
        if (utilisateurExistant && utilisateurExistant._id.toString() !== utilisateurId) {
            return res.status(400).json({
                success: false,
                message: 'Cette carte RFID est déjà assignée à un autre utilisateur'
            });
        }

        const utilisateur = await Utilisateur.findByIdAndUpdate(
            utilisateurId,
            {
                cardId,
                date_modification: Date.now()
            },
            { new: true }
        );  // Retirer le .select('-code -cardId') pour avoir accès à cardId

        if (!utilisateur) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Carte RFID assignée avec succès',
            data: {
                utilisateur: {
                    id: utilisateur._id,
                    matricule: utilisateur.matricule,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom,
                    email: utilisateur.email,
                    role: utilisateur.role,
                    actif: utilisateur.actif
                },
                carteRFID: {
                    id: utilisateur.cardId,
                    dateAssignation: utilisateur.date_modification
                }
            }
        });
    } catch (error) {
        console.error('Erreur assignation RFID:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'assignation de la carte RFID'
        });
    }
};

const importerUtilisateursCSV = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez fournir un fichier CSV'
            });
        }

        const fileContent = req.files.file.data.toString('utf8');

        // Parser le CSV
        const result = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true
        });

        if (result.errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Erreur dans le format du fichier CSV',
                errors: result.errors
            });
        }

        const utilisateursImportes = [];
        const erreurs = [];

        // Fonction pour générer la matricule
        const generateMatricule = async () => {
            let matriculeUnique = false;
            let matricule;
            let tentatives = 0;
            const maxTentatives = 50;
            while (!matriculeUnique && tentatives < maxTentatives) {
                const nombreAleatoire = Math.floor(1000 + Math.random() * 9000);
                matricule = `NAAT${nombreAleatoire}`;

                const utilisateurExistant = await Utilisateur.findOne({ matricule });
                if (!utilisateurExistant) {
                    matriculeUnique = true;
                }
                tentatives++;
            }

            if (!matriculeUnique) {
                throw new Error('Impossible de générer une matricule unique après plusieurs tentatives');
            }

            return matricule;
        };

        // Fonction pour générer un code unique
        const generateCode = async () => {
            let codeUnique = false;
            let code;
            let tentatives = 0;
            const maxTentatives = 50;
            while (!codeUnique && tentatives < maxTentatives) {
                code = Math.floor(1000 + Math.random() * 9000).toString();

                const utilisateurExistant = await Utilisateur.findOne({ code });
                if (!utilisateurExistant) {
                    codeUnique = true;
                }
                tentatives++;
            }

            if (!codeUnique) {
                throw new Error('Impossible de générer un code unique après plusieurs tentatives');
            }

            return code;
        };

        // Traiter chaque ligne du CSV
        for (const [index, row] of result.data.entries()) {
            try {
                // Vérifier les champs obligatoires
                if (!row.nom || !row.prenom) {
                    erreurs.push(`Ligne ${index + 2}: Nom et prénom requis`);
                    continue;
                }

                // Vérifier qu'au moins une méthode d'authentification est fournie
                if (!row.code && !(row.email && row.password)) {
                    erreurs.push(`Ligne ${index + 2}: Au moins une méthode d'authentification requise (code ou email/password)`);
                    continue;
                }

                // Vérifier le format du code si fourni
                if (row.code) {
                    if (!/^\d{4}$/.test(row.code.toString())) {
                        erreurs.push(`Ligne ${index + 2}: Le code doit être composé de 4 chiffres`);
                        continue;
                    }
                }

                // Générer une matricule unique
                const matricule = await generateMatricule();

                // Générer un code unique si non fourni
                const code = row.code ? row.code.toString() : await generateCode();

                // Créer l'utilisateur
                const nouvelUtilisateur = new Utilisateur({
                    matricule, // Ajout de la matricule générée
                    nom: row.nom,
                    prenom: row.prenom,
                    email: row.email || undefined,
                    password: row.password || undefined,
                    code, // Ajout du code généré ou fourni
                    role: row.role || 'utilisateur'
                });

                await nouvelUtilisateur.save();
                utilisateursImportes.push({
                    nom: nouvelUtilisateur.nom,
                    prenom: nouvelUtilisateur.prenom,
                    matricule: nouvelUtilisateur.matricule,
                    code: nouvelUtilisateur.code // Ajout du code dans la réponse
                });

            } catch (error) {
                erreurs.push(`Ligne ${index + 2}: ${error.message}`);
            }
        }

        res.json({
            success: true,
            message: 'Importation terminée',
            resultats: {
                total: result.data.length,
                importes: utilisateursImportes.length,
                erreurs: erreurs.length
            },
            utilisateursImportes,
            erreurs
        });

    } catch (error) {
        console.error('Erreur importation CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'importation du fichier CSV'
        });
    }
};



// Toggle activation utilisateur
const toggleActivationUtilisateur = async (req, res) => {
    try {
        const utilisateurId = req.params.id;

        // Utiliser findById d'abord pour vérifier l'existence
        const utilisateur = await Utilisateur.findById(utilisateurId);

        if (!utilisateur) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Mettre à jour uniquement le champ 'actif'
        // Utiliser l'option runValidators: false pour éviter la validation du code
        const utilisateurMaj = await Utilisateur.findByIdAndUpdate(
            utilisateurId,
            {
                $set: {
                    actif: !utilisateur.actif,
                    date_modification: Date.now()
                }
            },
            {
                new: true,
                runValidators: false // Désactive les validateurs
            }
        ).select('-code -password');

        res.json({
            success: true,
            message: `Utilisateur ${utilisateurMaj.actif ? 'activé' : 'désactivé'} avec succès`,
            utilisateur: utilisateurMaj
        });
    } catch (error) {
        console.error('Erreur toggle activation utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification du statut de l\'utilisateur'
        });
    }
};

module.exports = {
    creerUtilisateur,
    getTousUtilisateurs,
    getUtilisateurParId,
    modifierUtilisateur,
    supprimerUtilisateur,
    assignerCarteRFID,
    importerUtilisateursCSV,
    toggleActivationUtilisateur
};
