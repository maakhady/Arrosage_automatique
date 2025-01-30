const Arrosage = require('../models/Arrosage');
const Plante = require('../models/Plante');

// Créer un nouvel arrosage
const creerArrosage = async (req, res) => {
    try {
        const { plante, type, heureDebut, heureFin, volumeEau } = req.body;

        // Log des données reçues pour le débogage
        console.log('Données reçues:', {
            plante,
            type,
            heureDebut,
            heureFin,
            volumeEau
        });

        // Vérification plus détaillée des champs requis
        if (!plante) {
            return res.status(400).json({
                success: false,
                message: 'ID de plante requis'
            });
        }

        if (!type || !['manuel', 'automatique'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Type d\'arrosage invalide (doit être "manuel" ou "automatique")'
            });
        }

        if (!volumeEau || volumeEau <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Volume d\'eau invalide'
            });
        }

        // Validation améliorée des heures
        const isHeureValide = (heure) => {
            if (!heure || typeof heure !== 'object') return false;
            
            const { heures, minutes, secondes } = heure;
            
            // Vérification que les valeurs sont des nombres
            if (typeof heures !== 'number' || 
                typeof minutes !== 'number' || 
                typeof secondes !== 'number') {
                return false;
            }
            
            // Vérification des plages de valeurs
            return (
                heures >= 0 && heures <= 23 &&
                minutes >= 0 && minutes <= 59 &&
                secondes >= 0 && secondes <= 59
            );
        };

        if (!isHeureValide(heureDebut)) {
            return res.status(400).json({
                success: false,
                message: 'Format de l\'heure de début invalide'
            });
        }

        if (!isHeureValide(heureFin)) {
            return res.status(400).json({
                success: false,
                message: 'Format de l\'heure de fin invalide'
            });
        }

        // Vérification que l'heure de fin est après l'heure de début
        const debutEnSecondes = (heureDebut.heures * 3600) + 
                               (heureDebut.minutes * 60) + 
                               heureDebut.secondes;
        
        const finEnSecondes = (heureFin.heures * 3600) + 
                             (heureFin.minutes * 60) + 
                             heureFin.secondes;

        if (finEnSecondes <= debutEnSecondes) {
            return res.status(400).json({
                success: false,
                message: 'L\'heure de fin doit être après l\'heure de début'
            });
        }

        // Vérifier si la plante existe
        const planteExiste = await Plante.findById(plante);
        if (!planteExiste) {
            return res.status(404).json({
                success: false,
                message: 'Plante non trouvée'
            });
        }

        // Création de l'arrosage
        const nouvelArrosage = new Arrosage({
            plante,
            utilisateur: req.user._id,
            type,
            heureDebut,
            heureFin,
            volumeEau,
            actif: true
        });

        await nouvelArrosage.save();

        res.status(201).json({
            success: true,
            message: 'Arrosage programmé avec succès',
            arrosage: nouvelArrosage
        });
    } catch (error) {
        console.error('Erreur création arrosage:', error);
        
        // Gestion plus détaillée des erreurs
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                details: error.message
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Format d\'ID invalide',
                details: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'arrosage'
        });
    }
};

// Obtenir tous les arrosages de l'utilisateur
const getMesArrosages = async (req, res) => {
    try {
        const arrosages = await Arrosage.find({ utilisateur: req.user._id })
            .populate('plante', 'nom categorie')
            .sort({ date_creation: -1 });

        res.json({
            success: true,
            count: arrosages.length,
            arrosages
        });
    } catch (error) {
        console.error('Erreur récupération arrosages:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des arrosages'
        });
    }
};

// Obtenir un arrosage spécifique
const getArrosageParId = async (req, res) => {
    try {
        const arrosage = await Arrosage.findOne({
            _id: req.params.id,
            utilisateur: req.user._id
        }).populate('plante', 'nom categorie');

        if (!arrosage) {
            return res.status(404).json({
                success: false,
                message: 'Arrosage non trouvé'
            });
        }

        res.json({
            success: true,
            arrosage
        });
    } catch (error) {
        console.error('Erreur récupération arrosage:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'arrosage'
        });
    }
};

// Modifier un arrosage
const modifierArrosage = async (req, res) => {
    try {
        const { type, heureDebut, heureFin, volumeEau, actif } = req.body;
        const updates = {};

        if (type) updates.type = type;
        if (heureDebut && isHeureValide(heureDebut)) updates.heureDebut = heureDebut;
        if (heureFin && isHeureValide(heureFin)) updates.heureFin = heureFin;
        if (volumeEau) updates.volumeEau = volumeEau;
        if (actif !== undefined) updates.actif = actif;

        updates.date_modification = Date.now();

        const arrosage = await Arrosage.findOneAndUpdate(
            {
                _id: req.params.id,
                utilisateur: req.user._id
            },
            updates,
            { new: true, runValidators: true }
        ).populate('plante', 'nom categorie');

        if (!arrosage) {
            return res.status(404).json({
                success: false,
                message: 'Arrosage non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Arrosage modifié avec succès',
            arrosage
        });
    } catch (error) {
        console.error('Erreur modification arrosage:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de l\'arrosage'
        });
    }
};

// Supprimer un arrosage
const supprimerArrosage = async (req, res) => {
    try {
        const arrosage = await Arrosage.findOneAndDelete({
            _id: req.params.id,
            utilisateur: req.user._id
        });

        if (!arrosage) {
            return res.status(404).json({
                success: false,
                message: 'Arrosage non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Arrosage supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur suppression arrosage:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'arrosage'
        });
    }
};

// Activer/Désactiver un arrosage
const toggleArrosage = async (req, res) => {
    try {
        const arrosage = await Arrosage.findOne({
            _id: req.params.id,
            utilisateur: req.user._id
        });

        if (!arrosage) {
            return res.status(404).json({
                success: false,
                message: 'Arrosage non trouvé'
            });
        }

        arrosage.actif = !arrosage.actif;
        arrosage.date_modification = Date.now();
        await arrosage.save();

        res.json({
            success: true,
            message: `Arrosage ${arrosage.actif ? 'activé' : 'désactivé'} avec succès`,
            arrosage
        });
    } catch (error) {
        console.error('Erreur toggle arrosage:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de l\'état de l\'arrosage'
        });
    }
};

// Fonction utilitaire pour vérifier le format de l'heure
const isHeureValide = (heure) => {
    if (!heure.heures || !heure.minutes || !heure.secondes) return false;
    
    const { heures, minutes, secondes } = heure;
    
    return (
        heures >= 0 && heures <= 23 &&
        minutes >= 0 && minutes <= 59 &&
        secondes >= 0 && secondes <= 59
    );
};

// Arrosage manuel d'une plante spécifique
const arrosageManuelPlante = async (req, res) => {
    try {
        const { planteId } = req.params;
        const { volumeEau } = req.body;

        const plante = await Plante.findById(planteId);
        if (!plante) {
            return res.status(404).json({
                success: false,
                message: 'Plante non trouvée'
            });
        }

        const maintenant = new Date();
        const finArrosage = new Date(maintenant.getTime() + 300000); // Ajoute 5 minute

        const arrosage = new Arrosage({
            plante: planteId,
            utilisateur: req.user._id,
            type: 'manuel',
            heureDebut: {
                heures: maintenant.getHours(),
                minutes: maintenant.getMinutes(),
                secondes: maintenant.getSeconds()
            },
            heureFin: {
                heures: finArrosage.getHours(),
                minutes: finArrosage.getMinutes(),
                secondes: finArrosage.getSeconds()
            },
            volumeEau: volumeEau || plante.volumeEau
        });

        await arrosage.save();

        res.json({
            success: true,
            message: 'Arrosage manuel déclenché avec succès',
            arrosage
        });
    } catch (error) {
        console.error('Erreur arrosage manuel plante:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'arrosage manuel',
            details: error.message
        });
    }
};

// Arrêt d'urgence de l'arrosage
const arreterArrosage = async (req, res) => {
    try {
        // Ici, vous désactiverez toutes les pompes
        // Code pour arrêter tous les relais/pompes

        res.json({
            success: true,
            message: 'Arrosage arrêté avec succès'
        });
    } catch (error) {
        console.error('Erreur arrêt arrosage:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'arrêt de l\'arrosage'
        });
    }
};


// Arrosage manuel de toutes les plantes
const arrosageManuelGlobal = async (req, res) => {
    try {
        // Récupérer toutes les plantes
        const plantes = await Plante.find();

        if (plantes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucune plante trouvée dans le système'
            });
        }

        // Créer des enregistrements d'arrosage pour chaque plante
        const arrosages = await Promise.all(plantes.map(async (plante) => {
            const maintenant = new Date();
            const finArrosage = new Date(maintenant.getTime() + 300000); // Ajoute 1 minute

            const arrosage = new Arrosage({
                plante: plante._id,
                utilisateur: req.user._id,
                type: 'manuel',
                heureDebut: {
                    heures: maintenant.getHours(),
                    minutes: maintenant.getMinutes(),
                    secondes: maintenant.getSeconds()
                },
                heureFin: {
                    heures: finArrosage.getHours(),
                    minutes: finArrosage.getMinutes(),
                    secondes: finArrosage.getSeconds()
                },
                volumeEau: plante.volumeEau
            });

            await arrosage.save();
            return arrosage;
        }));

        res.json({
            success: true,
            message: 'Arrosage manuel global déclenché avec succès',
            nombrePlantes: plantes.length,
            arrosages
        });
    } catch (error) {
        console.error('Erreur arrosage manuel global:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'arrosage manuel global',
            details: error.message
        });
    }
};

module.exports = {
    creerArrosage,
    getMesArrosages,
    getArrosageParId,
    modifierArrosage,
    supprimerArrosage,
    toggleArrosage,
    arrosageManuelPlante,
    arreterArrosage,
    arrosageManuelGlobal
};