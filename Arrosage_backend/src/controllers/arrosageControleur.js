const Arrosage = require('../models/Arrosage');
const mongoose = require('mongoose');

const Plante = require('../models/Plante');
const HistoriqueArrosage = require('../models/HistoriqueArrosage');

// Fonction utilitaire pour la création de l'historique
// Fonction utilitaire pour la création de l'historique
const creerHistorique = async (arrosage, donneesCapteursActuelles) => {
    try {
        const historique = new HistoriqueArrosage({
            // Ces champs correspondent exactement à votre schéma
            plante: arrosage.plante,                      // ObjectId de la plante
            utilisateur: arrosage.utilisateur,            // ObjectId de l'utilisateur
            date: new Date(),                             // Date actuelle
            type: arrosage.type,                          // 'manuel' ou 'automatique'
            volumeEau: arrosage.volumeEau,                // Nombre
            humiditeSol: donneesCapteursActuelles.humiditeSol,  // Nombre
            luminosite: donneesCapteursActuelles.luminosite,    // Nombre
            parametreUtilise: arrosage.parametreUtilise || `Volume: ${arrosage.volumeEau}ml`,  // String
            id_arrosage: arrosage._id                     // ObjectId de l'arrosage
        });

        return await historique.save();
    } catch (error) {
        console.error('Erreur création historique:', error);
        throw error;
    }
};

// Fonction utilitaire pour vérifier le format de l'heure
const isHeureValide = (heure) => {
    if (heure.heures === undefined || heure.minutes === undefined || heure.secondes === undefined) return false;
    
    const { heures, minutes, secondes } = heure;
    
    return (
        heures >= 0 && heures <= 23 &&
        minutes >= 0 && minutes <= 59 &&
        secondes >= 0 && secondes <= 59
    );
};

// Créer un nouvel arrosage
const creerArrosage = async (req, res) => {
    try {
        const { plante, type, heureDebut, heureFin, volumeEau } = req.body;
        const donneesCapteursActuelles = req.body; // Pour les tests, on prend du body

        console.log('Données reçues:', { plante, type, heureDebut, heureFin, volumeEau });

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

        const planteExiste = await Plante.findById(plante);
        if (!planteExiste) {
            return res.status(404).json({
                success: false,
                message: 'Plante non trouvée'
            });
        }

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

        // Création de l'historique avec les données des capteurs
        const historique = await creerHistorique(nouvelArrosage, donneesCapteursActuelles);

        res.status(201).json({
            success: true,
            message: 'Arrosage programmé avec succès',
            arrosage: nouvelArrosage,
            historique
        });
    } catch (error) {
        console.error('Erreur création arrosage:', error);
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

        // Création d'un nouvel historique pour la modification
        const donneesCapteursActuelles = req.body; // Pour les tests
        const historique = await creerHistorique(arrosage, donneesCapteursActuelles);

        res.json({
            success: true,
            message: 'Arrosage modifié avec succès',
            arrosage,
            historique
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

        // Création d'un historique pour le changement d'état
        const donneesCapteursActuelles = req.body; // Pour les tests
        const historique = await creerHistorique(arrosage, donneesCapteursActuelles);

        res.json({
            success: true,
            message: `Arrosage ${arrosage.actif ? 'activé' : 'désactivé'} avec succès`,
            arrosage,
            historique
        });
    } catch (error) {
        console.error('Erreur toggle arrosage:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de l\'état de l\'arrosage'
        });
    }
};

// Arrosage manuel d'une plante spécifique
const arrosageManuelPlante = async (req, res) => {
    try {
        const { planteId } = req.params;
        const { volumeEau } = req.body;
        const donneesCapteursActuelles = req.body; // Pour les tests

        const plante = await Plante.findById(planteId);
        if (!plante) {
            return res.status(404).json({
                success: false,
                message: 'Plante non trouvée'
            });
        }

        const maintenant = new Date();
        const finArrosage = new Date(maintenant.getTime() + 300000); // 5 minutes

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

        // Création de l'historique
        const historique = await creerHistorique(arrosage, donneesCapteursActuelles);

        res.json({
            success: true,
            message: 'Arrosage manuel déclenché avec succès',
            arrosage,
            historique
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
        const plantes = await Plante.find();
        const donneesCapteursActuelles = req.body; // Pour les tests

        if (plantes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucune plante trouvée dans le système'
            });
        }

        const resultats = await Promise.all(plantes.map(async (plante) => {
            const maintenant = new Date();
            const finArrosage = new Date(maintenant.getTime() + 300000);

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
            const historique = await creerHistorique(arrosage, donneesCapteursActuelles);

            return { arrosage, historique };
        }));

        res.json({
            success: true,
            message: 'Arrosage manuel global déclenché avec succès',
            nombrePlantes: plantes.length,
            resultats
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


// Obtenir l'historique par jour (Lundi au Vendredi)
// const getHistoriqueParJour = async (req, res) => {
//     try {
//         const { date } = req.query; // Format YYYY-MM-DD
//         const debutJour = new Date(date);
//         debutJour.setHours(0, 0, 0, 0);
//         const finJour = new Date(date);
//         finJour.setHours(23, 59, 59, 999);

//         const historiques = await HistoriqueArrosage.aggregate([
//             {
//                 $match: {
//                     date: {
//                         $gte: debutJour,
//                         $lte: finJour
//                     },
//                     utilisateur: req.user._id
//                 }
//             },
//             {
//                 $group: {
//                     _id: {
//                         heure: { $hour: "$date" }
//                     },
//                     totalVolumeEau: { $sum: "$volumeEau" },
//                     nombreArrosages: { $sum: 1 }
//                 }
//             },
//             {
//                 $sort: { "_id.heure": 1 }
//             }
//         ]);

//         res.json({
//             success: true,
//             historiques
//         });
//     } catch (error) {
//         console.error('Erreur récupération historique par jour:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Erreur lors de la récupération de l\'historique'
//         });
//     }
// };
const getHistoriqueParJour = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'La date est requise'
            });
        }

        const debutJour = new Date(date);
        const finJour = new Date(date);
        finJour.setHours(23, 59, 59, 999);

        console.log('Période de recherche:', {
            debut: debutJour,
            fin: finJour,
            utilisateur: req.user._id
        });

        const historiques = await HistoriqueArrosage.aggregate([
            {
                $match: {
                    date: {
                        $gte: debutJour,
                        $lte: finJour
                    },
                    utilisateur: new mongoose.Types.ObjectId(req.user._id)  // Conversion explicite
                }
            },
            {
                $group: {
                    _id: {
                        heure: { $hour: "$date" }
                    },
                    totalVolumeEau: { $sum: "$volumeEau" },
                    nombreArrosages: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.heure": 1 }
            }
        ]).exec();  // Ajout de .exec()

        // Création du tableau des 24 heures
        const heuresCompletes = Array.from({ length: 24 }, (_, heure) => {
            const historiqueHeure = historiques.find(h => h._id.heure === heure);
            return {
                heure,
                totalVolumeEau: historiqueHeure ? historiqueHeure.totalVolumeEau : 0,
                nombreArrosages: historiqueHeure ? historiqueHeure.nombreArrosages : 0
            };
        });

        res.json({
            success: true,
            date: debutJour.toISOString().split('T')[0],
            totalJour: {
                volumeEau: heuresCompletes.reduce((sum, h) => sum + h.totalVolumeEau, 0),
                nombreArrosages: heuresCompletes.reduce((sum, h) => sum + h.nombreArrosages, 0)
            },
            historiques: heuresCompletes
        });

    } catch (error) {
        console.error('Détails de l\'erreur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'historique',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
// Obtenir l'historique par semaine
// const getHistoriqueParSemaine = async (req, res) => {
//     try {
//         const { debut, fin } = req.query; // Format YYYY-MM-DD
//         const debutSemaine = new Date(debut);
//         const finSemaine = new Date(fin);

//         const historiques = await HistoriqueArrosage.aggregate([
//             {
//                 $match: {
//                     date: {
//                         $gte: debutSemaine,
//                         $lte: finSemaine
//                     },
//                     utilisateur: req.user._id
//                 }
//             },
//             {
//                 $group: {
//                     _id: {
//                         jour: { $dayOfWeek: "$date" }
//                     },
//                     totalVolumeEau: { $sum: "$volumeEau" },
//                     nombreArrosages: { $sum: 1 }
//                 }
//             },
//             {
//                 $match: {
//                     "_id.jour": { $gte: 2, $lte: 6 } // Du Lundi (2) au Vendredi (6)
//                 }
//             },
//             {
//                 $sort: { "_id.jour": 1 }
//             }
//         ]);

//         res.json({
//             success: true,
//             historiques
//         });
//     } catch (error) {
//         console.error('Erreur récupération historique par semaine:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Erreur lors de la récupération de l\'historique'
//         });
//     }
// };
const getHistoriqueParSemaine = async (req, res) => {
    try {
        const { debut, fin } = req.query;
        if (!debut || !fin) {
            return res.status(400).json({
                success: false,
                message: 'Les dates de début et de fin sont requises'
            });
        }

        const debutSemaine = new Date(debut);
        const finSemaine = new Date(fin);

        // Pour debug
        console.log('Recherche entre:', debutSemaine, 'et', finSemaine);

        const historiques = await HistoriqueArrosage.aggregate([
            {
                $match: {
                    date: {
                        $gte: debutSemaine,
                        $lte: finSemaine
                    },
                    utilisateur: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $group: {
                    _id: {
                        jour: { $dayOfWeek: "$date" },
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
                    },
                    totalVolumeEau: { $sum: "$volumeEau" },
                    nombreArrosages: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.jour": 1 }
            }
        ]);

        // Créer un tableau des jours de la semaine (Lundi à Vendredi)
        const joursNoms = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
        const joursSemaine = joursNoms.map((nom, index) => {
            // MongoDB utilise 1 pour Dimanche, donc Lundi = 2, ..., Vendredi = 6
            const jourMongoDB = index + 2;
            const historiqueJour = historiques.find(h => h._id.jour === jourMongoDB);
            
            return {
                jour: nom,
                numeroDuJour: jourMongoDB,
                date: historiqueJour ? historiqueJour._id.date : null,
                totalVolumeEau: historiqueJour ? historiqueJour.totalVolumeEau : 0,
                nombreArrosages: historiqueJour ? historiqueJour.nombreArrosages : 0
            };
        });

        res.json({
            success: true,
            periode: {
                debut: debutSemaine.toISOString().split('T')[0],
                fin: finSemaine.toISOString().split('T')[0]
            },
            totalSemaine: {
                volumeEau: joursSemaine.reduce((sum, jour) => sum + jour.totalVolumeEau, 0),
                nombreArrosages: joursSemaine.reduce((sum, jour) => sum + jour.nombreArrosages, 0)
            },
            historiques: joursSemaine
        });

    } catch (error) {
        console.error('Détails de l\'erreur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'historique',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Obtenir l'historique par mois
const getHistoriqueParMois = async (req, res) => {
    try {
        const { mois, annee } = req.query; // mois: 1-12, annee: YYYY
        const debut = new Date(annee, mois - 1, 1);
        const fin = new Date(annee, mois, 0);

        const historiques = await HistoriqueArrosage.aggregate([
            {
                $match: {
                    date: {
                        $gte: debut,
                        $lte: fin
                    },
                    utilisateur: req.user._id
                }
            },
            {
                $group: {
                    _id: {
                        jour: { $dayOfMonth: "$date" }
                    },
                    totalVolumeEau: { $sum: "$volumeEau" },
                    nombreArrosages: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.jour": 1 }
            }
        ]);

        res.json({
            success: true,
            historiques
        });
    } catch (error) {
        console.error('Erreur récupération historique par mois:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'historique'
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
    getHistoriqueParJour,
    getHistoriqueParMois,
    getHistoriqueParSemaine,

};