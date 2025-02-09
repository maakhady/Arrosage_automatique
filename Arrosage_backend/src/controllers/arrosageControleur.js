const mongoose = require('mongoose');
const Arrosage = require('../models/Arrosage');
const Plante = require('../models/Plante');
const HistoriqueArrosage = require('../models/HistoriqueArrosage');
const pompeService = require('../services/pompeService');


// Fonction utilitaire pour créer un historique

// const creerHistoriqueArrosage = async (arrosage) => {
//     try {
//         console.log("Création de l'historique pour l'arrosage:", {
//             id: arrosage._id,
//             type: arrosage.type,
//             volumeEau: arrosage.volumeEau
//         });

//         const historique = new HistoriqueArrosage({
//             plante: arrosage.plante,
//             utilisateur: arrosage.utilisateur,
//             id_arrosage: arrosage._id,
//             type: arrosage.type,
//             heureDebut: arrosage.heureDebut,
//             heureFin: arrosage.heureFin,
//             volumeEau: arrosage.volumeEau,
//             parametresArrosage: arrosage.parametresArrosage,
//             actif: arrosage.actif
//         });

//         const savedHistorique = await historique.save();
//         console.log("Historique créé avec succès", savedHistorique);
//         return savedHistorique;
//     } catch (error) {
//         console.error("Erreur lors de la création de l'historique:", error);
//         throw error;
//     }
// };

const creerHistoriqueArrosage = async (arrosage) => {
    try {
        console.log("Création de l'historique pour l'arrosage:", {
            id: arrosage._id,
            type: arrosage.type,
            volumeEau: arrosage.volumeEau // Assurez-vous que cette valeur est correcte
        });

        const historique = new HistoriqueArrosage({
            plante: arrosage.plante,
            utilisateur: arrosage.utilisateur,
            id_arrosage: arrosage._id,
            type: arrosage.type,
            heureDebut: arrosage.heureDebut,
            heureFin: arrosage.heureFin,
            volumeEau: arrosage.volumeEau, // Utilisez directement arrosage.volumeEau
            parametresArrosage: arrosage.parametresArrosage,
            actif: arrosage.actif
        });

        const savedHistorique = await historique.save();
        console.log("Historique créé avec succès", savedHistorique);
        return savedHistorique;
    } catch (error) {
        console.error("Erreur lors de la création de l'historique:", error);
        throw error;
    }
};

// Créer un nouvel arrosage
const creerArrosage = async (req, res) => {
    try {
        const { plante, type, heureDebut, heureFin, volumeEau, parametresArrosage } = req.body;

        // Log des données reçues pour le débogage
        console.log('Données reçues:', {
            plante,
            type,
            heureDebut,
            heureFin,
            volumeEau,
            parametresArrosage
        });

        // Vérification des champs requis
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

        // Validation des paramètres d'arrosage automatique
        if (type === 'automatique') {
            if (!parametresArrosage) {
                return res.status(400).json({
                    success: false,
                    message: 'Paramètres d\'arrosage requis pour le mode automatique'
                });
            }

            // Vérification des paramètres spécifiques
            if (!parametresArrosage.humiditeSolRequise || !parametresArrosage.luminositeRequise) {
                return res.status(400).json({
                    success: false,
                    message: 'Humidité du sol et luminosité requises pour l\'arrosage automatique'
                });
            }

            // Vérification de la cohérence avec les caractéristiques de la plante
            if (parametresArrosage.humiditeSolRequise < planteExiste.humiditeSol) {
                return res.status(400).json({
                    success: false,
                    message: 'L\'humidité requise ne peut pas être inférieure à l\'humidité minimale de la plante'
                });
            }

            if (volumeEau > planteExiste.volumeEau) {
                return res.status(400).json({
                    success: false,
                    message: 'Le volume d\'eau ne peut pas dépasser le volume maximal de la plante'
                });
            }
        }

       // Création de l'objet arrosage
       const nouvelArrosage = new Arrosage({
        plante,
        utilisateur: req.user._id,
        type,
        heureDebut,
        heureFin,
        volumeEau: Number(volumeEau),
        parametresArrosage: type === 'automatique' ? {
            humiditeSolRequise: parametresArrosage.humiditeSolRequise,
            luminositeRequise: parametresArrosage.luminositeRequise,
            volumeEau: Number(volumeEau)
        } : undefined,
        actif: true
    });

    // Sauvegarder l'arrosage
    const arrosageSauve = await nouvelArrosage.save();
    console.log('Arrosage sauvegardé:', arrosageSauve);

    // Créer l'historique avec les bonnes valeurs pour volumeEau
    const donneesHistorique = {
        plante: arrosageSauve.plante,
        utilisateur: arrosageSauve.utilisateur,
        id_arrosage: arrosageSauve._id,
        type: arrosageSauve.type,
        heureDebut: {
            heures: arrosageSauve.heureDebut.heures,
            minutes: arrosageSauve.heureDebut.minutes,
            secondes: arrosageSauve.heureDebut.secondes
        },
        heureFin: {
            heures: arrosageSauve.heureFin.heures,
            minutes: arrosageSauve.heureFin.minutes,
            secondes: arrosageSauve.heureFin.secondes
        },
        volumeEau: Number(volumeEau) // Utiliser la valeur originale
    };

    // Ajouter les paramètres d'arrosage si nécessaire
    if (type === 'automatique') {
        donneesHistorique.parametresArrosage = {
            humiditeSolRequise: parametresArrosage.humiditeSolRequise,
            luminositeRequise: parametresArrosage.luminositeRequise,
            volumeEau: Number(volumeEau) // Utiliser la valeur originale
        };
    }

    console.log('Données historique avant création:', donneesHistorique);

    const historique = new HistoriqueArrosage(donneesHistorique);
    const historiqueSauve = await historique.save();

    console.log('Historique sauvegardé:', historiqueSauve);

    res.status(201).json({
        success: true,
        message: 'Arrosage programmé avec succès',
        arrosage: arrosageSauve,
        historique: historiqueSauve
    });
} catch (error) {
    console.error('Erreur création arrosage:', error);
    
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
        message: 'Erreur lors de la création de l\'arrosage',
        details: error.message
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
        });const nouvelArrosage = new Arrosage({
            plante,
            utilisateur: req.user._id,
            type,
            heureDebut,
            heureFin,
            volumeEau: Number(volumeEau),
            parametresArrosage: type === 'automatique' ? {
                humiditeSolRequise: parametresArrosage.humiditeSolRequise,
                luminositeRequise: parametresArrosage.luminositeRequise,
                volumeEau: Number(volumeEau)
            } : undefined,
            actif: true
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
        const { 
            type, 
            heureDebut, 
            heureFin, 
            volumeEau, 
            actif,
            parametresArrosage 
        } = req.body;
        
        console.log('Données de modification reçues:', {
            type,
            heureDebut,
            heureFin,
            volumeEau,
            actif,
            parametresArrosage
        });

        // Vérifier d'abord si l'arrosage existe
        const arrosageExistant = await Arrosage.findOne({
            _id: req.params.id,
            utilisateur: req.user._id
        }).populate('plante');

        if (!arrosageExistant) {
            return res.status(404).json({
                success: false,
                message: 'Arrosage non trouvé'
            });
        }

        // Préparer les mises à jour
        const updates = {
            date_modification: Date.now()
        };

        // Mise à jour des champs si fournis
        if (type) updates.type = type;
        if (heureDebut) updates.heureDebut = heureDebut;  // Suppression de la validation isHeureValide
        if (heureFin) updates.heureFin = heureFin;        // Suppression de la validation isHeureValide
        if (volumeEau !== undefined) updates.volumeEau = Number(volumeEau);
        if (actif !== undefined) updates.actif = actif;

        // Utilisation du volume d'eau existant si non fourni
        const volumeEauFinal = volumeEau !== undefined ? 
            Number(volumeEau) : 
            arrosageExistant.parametresArrosage?.volumeEau || arrosageExistant.volumeEau;

        // Vérification du volume d'eau par rapport à la plante
        if (volumeEauFinal > arrosageExistant.plante.volumeEau) {
            return res.status(400).json({
                success: false,
                message: 'Le volume d\'eau ne peut pas dépasser le volume maximal de la plante'
            });
        }

        // Gestion des paramètres d'arrosage automatique
        if (arrosageExistant.type === 'automatique') {
            updates.parametresArrosage = {
                humiditeSolRequise: parametresArrosage?.humiditeSolRequise || arrosageExistant.parametresArrosage.humiditeSolRequise,
                luminositeRequise: parametresArrosage?.luminositeRequise || arrosageExistant.parametresArrosage.luminositeRequise,
                volumeEau: volumeEauFinal
            };

            // Vérification de l'humidité minimale
            if (updates.parametresArrosage.humiditeSolRequise < arrosageExistant.plante.humiditeSol) {
                return res.status(400).json({
                    success: false,
                    message: 'L\'humidité requise ne peut pas être inférieure à l\'humidité minimale de la plante'
                });
            }
        }

        console.log('Mises à jour à appliquer:', updates);

        // Mettre à jour l'arrosage
        const arrosageMisAJour = await Arrosage.findOneAndUpdate(
            { _id: req.params.id, utilisateur: req.user._id },
            updates,
            { new: true, runValidators: true }
        ).populate('plante', 'nom categorie');

        // Créer l'historique
        const historique = new HistoriqueArrosage({
            plante: arrosageMisAJour.plante._id,
            utilisateur: arrosageMisAJour.utilisateur,
            id_arrosage: arrosageMisAJour._id,
            type: arrosageMisAJour.type,
            heureDebut: arrosageMisAJour.heureDebut,
            heureFin: arrosageMisAJour.heureFin,
            volumeEau: volumeEauFinal,
            parametresArrosage: arrosageMisAJour.type === 'automatique' ? {
                humiditeSolRequise: arrosageMisAJour.parametresArrosage.humiditeSolRequise,
                luminositeRequise: arrosageMisAJour.parametresArrosage.luminositeRequise,
                volumeEau: volumeEauFinal
            } : undefined,
            actif: arrosageMisAJour.actif
        });

        await historique.save();

        res.json({
            success: true,
            message: 'Arrosage modifié avec succès',
            arrosage: arrosageMisAJour,
            historique
        });
    } catch (error) {
        console.error('Erreur modification arrosage:', error);
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
            message: 'Erreur lors de la modification de l\'arrosage',
            details: error.message
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

        console.log('Données reçues pour arrosage manuel:', {
            planteId,
            volumeEau
        });

        // Vérifier si l'ID de la plante est valide
        if (!mongoose.Types.ObjectId.isValid(planteId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de plante invalide'
            });
        }

        // Vérifier si la plante existe
        const plante = await Plante.findById(planteId);
        if (!plante) {
            return res.status(404).json({
                success: false,
                message: 'Plante non trouvée'
            });
        }

        // Vérifier le volume d'eau
        const volumeEauFinal = Number(volumeEau || plante.volumeEau);
        if (volumeEauFinal > plante.volumeEau) {
            return res.status(400).json({
                success: false,
                message: 'Le volume d\'eau ne peut pas dépasser le volume maximal de la plante'
            });
        }

        const maintenant = new Date();
        const finArrosage = new Date(maintenant.getTime() + 300000); // Ajoute 5 minutes

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
            volumeEau: volumeEauFinal,
            parametresArrosage: {
                humiditeSolRequise: plante.humiditeSol,
                luminositeRequise: plante.luminosite,
                volumeEau: volumeEauFinal
            },
            actif: true
        });
        
        const arrosageSauve = await arrosage.save();
        console.log('Arrosage sauvegardé:', arrosageSauve);
        
        // Créer directement l'historique au lieu d'utiliser creerHistoriqueArrosage
        const historique = new HistoriqueArrosage({
            plante: arrosageSauve.plante,
            utilisateur: arrosageSauve.utilisateur,
            id_arrosage: arrosageSauve._id,
            type: arrosageSauve.type,
            heureDebut: arrosageSauve.heureDebut,
            heureFin: arrosageSauve.heureFin,
            volumeEau: volumeEauFinal, // S'assurer que le volumeEau est bien défini
            parametresArrosage: {
                humiditeSolRequise: plante.humiditeSol,
                luminositeRequise: plante.luminosite,
                volumeEau: volumeEauFinal
            },
            actif: arrosageSauve.actif
        });

        const historiqueSauve = await historique.save();
        console.log('Historique créé:', historiqueSauve);

        res.json({
            success: true,
            message: 'Arrosage manuel déclenché avec succès',
            arrosage: arrosageSauve,
            historique: historiqueSauve
        });
    } catch (error) {
        console.error('Erreur arrosage manuel plante:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                details: error.message
            });
        }
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
        // Utiliser le service pompe pour arrêter l'arrosage
        const flaskResponse = await pompeService.arreterArrosage();

        if (flaskResponse.success) {
            // Mettre à jour tous les arrosages actifs en cours à inactif
            await Arrosage.updateMany(
                { actif: true },
                { 
                    actif: false,
                    heureFin: {
                        heures: new Date().getHours(),
                        minutes: new Date().getMinutes(),
                        secondes: new Date().getSeconds()
                    }
                }
            );

            // Mettre à jour l'historique correspondant
            await HistoriqueArrosage.updateMany(
                { actif: true },
                { 
                    actif: false,
                    heureFin: {
                        heures: new Date().getHours(),
                        minutes: new Date().getMinutes(),
                        secondes: new Date().getSeconds()
                    }
                }
            );

            res.json({
                success: true,
                message: 'Arrosage arrêté avec succès'
            });
        } else {
            throw new Error('Échec de l\'arrêt de la pompe');
        }
    } catch (error) {
        console.error('Erreur arrêt arrosage:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'arrêt de l\'arrosage',
            details: error.message
        });
    }
};

// Arrosage manuel de toutes les plantes
const arrosageManuelGlobal = async (req, res) => {
    try {
        // Utiliser le service pompe pour démarrer l'arrosage
        const flaskResponse = await pompeService.demarrerArrosageManuel();

        if (flaskResponse.success) {
            const plantes = await Plante.find();

            if (plantes.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Aucune plante trouvée dans le système'
                });
            }

            const resultatArrosages = [];
            const maintenant = new Date();
            const finArrosage = new Date(maintenant.getTime() + 300000); // +5 minutes

            for (const plante of plantes) {
                const volumeEauPlante = plante.volumeEau;

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
                    volumeEau: volumeEauPlante,
                    parametresArrosage: {
                        humiditeSolRequise: plante.humiditeSol,
                        luminositeRequise: plante.luminosite,
                        volumeEau: volumeEauPlante
                    }
                });

                const arrosageSauve = await arrosage.save();

                const historique = new HistoriqueArrosage({
                    plante: arrosageSauve.plante,
                    utilisateur: arrosageSauve.utilisateur,
                    id_arrosage: arrosageSauve._id,
                    type: arrosageSauve.type,
                    heureDebut: arrosageSauve.heureDebut,
                    heureFin: arrosageSauve.heureFin,
                    volumeEau: volumeEauPlante,
                    parametresArrosage: {
                        humiditeSolRequise: plante.humiditeSol,
                        luminositeRequise: plante.luminosite,
                        volumeEau: volumeEauPlante
                    },
                    actif: arrosageSauve.actif
                });

                const historiqueSauve = await historique.save();

                resultatArrosages.push({
                    plante: {
                        id: plante._id,
                        nom: plante.nom
                    },
                    arrosage: arrosageSauve,
                    historique: historiqueSauve
                });
            }

            res.json({
                success: true,
                message: 'Arrosage manuel global déclenché avec succès',
                nombrePlantes: plantes.length,
                resultats: resultatArrosages
            });
        } else {
            throw new Error('Échec du démarrage de la pompe');
        }
    } catch (error) {
        console.error('Erreur arrosage manuel global:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                details: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'arrosage manuel global',
            details: error.message
        });
    }
};

// controllers/arrosageControleur.js
const getArrosagesScheduled = async (req, res) => {
    try {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        console.log(`Vérification des arrosages à ${currentHour}:${currentMinute}`);

        // Trouver les arrosages qui doivent démarrer maintenant
        const arrosagesADemarrer = await Arrosage.find({
            actif: true,
            type: 'automatique',
            'heureDebut.heures': currentHour,
            'heureDebut.minutes': currentMinute
        }).populate('plante');

        console.log('Arrosages à démarrer:', arrosagesADemarrer);

        // Trouver les arrosages qui doivent s'arrêter maintenant
        const arrosagesAArreter = await Arrosage.find({
            actif: true,
            type: 'automatique',
            'heureFin.heures': currentHour,
            'heureFin.minutes': currentMinute
        }).populate('plante');

        console.log('Arrosages à arrêter:', arrosagesAArreter);

        res.json({
            success: true,
            message: 'Arrosages programmés récupérés',
            arrosagesADemarrer,
            arrosagesAArreter
        });

    } catch (error) {
        console.error('Erreur récupération arrosages programmés:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des arrosages programmés'
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
    arrosageManuelGlobal,
    getArrosagesScheduled
};