const HistoriqueArrosage = require('../models/HistoriqueArrosage');
const Plante = require('../models/Plante');
const Arrosage = require('../models/Arrosage');
const mongoose = require('mongoose');

// Fonction utilitaire pour créer un historique
const creerHistoriqueArrosage = async (arrosage) => {
    try {
        const historique = new HistoriqueArrosage({
            plante: arrosage.plante,
            utilisateur: arrosage.utilisateur,
            id_arrosage: arrosage._id,
            type: arrosage.type,
            heureDebut: arrosage.heureDebut,
            heureFin: arrosage.heureFin,
            volumeEau: arrosage.volumeEau,
            parametresArrosage: arrosage.parametresArrosage,
            actif: arrosage.actif
        });

        const savedHistorique = await historique.save();
        console.log("Historique créé avec succès:", savedHistorique);
        return savedHistorique;
    } catch (error) {
        console.error("Erreur lors de la création de l'historique:", error);
        throw error;
    }
};

// Obtenir l'historique complet des arrosages
const getHistoriqueComplet = async (req, res) => {
    try {
        const { page = 1, limit = 10, dateDebut, dateFin } = req.query;
        const query = { utilisateur: req.user._id };

        // Validation des paramètres
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
            return res.status(400).json({
                success: false,
                message: 'Paramètres de pagination invalides'
            });
        }

        // Filtrer par date si spécifié
        if (dateDebut || dateFin) {
            query.date = {};
            if (dateDebut) {
                const dateDebutValid = new Date(dateDebut);
                if (isNaN(dateDebutValid)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Date de début invalide'
                    });
                }
                query.date.$gte = dateDebutValid;
            }
            if (dateFin) {
                const dateFinValid = new Date(dateFin);
                if (isNaN(dateFinValid)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Date de fin invalide'
                    });
                }
                query.date.$lte = dateFinValid;
            }
        }

        const [historiques, count] = await Promise.all([
            HistoriqueArrosage.find(query)
                .populate('plante', 'nom categorie')
                .populate('id_arrosage', 'type parametreUtilise')
                .sort({ date: -1 })
                .limit(limitNum)
                .skip((pageNum - 1) * limitNum)
                .lean(),
            HistoriqueArrosage.countDocuments(query)
        ]);

        if (historiques.length === 0 && pageNum > 1) {
            return res.status(404).json({
                success: false,
                message: 'Page non trouvée'
            });
        }

        res.json({
            success: true,
            historiques,
            totalPages: Math.ceil(count / limitNum),
            currentPage: pageNum,
            totalHistoriques: count
        });
    } catch (error) {
        console.error('Erreur récupération historique:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'historique'
        });
    }
};

// Obtenir l'historique d'une plante spécifique
const getHistoriquePlante = async (req, res) => {
    try {
        const { planteId } = req.params;
        const { page = 1, limit = 10, dateDebut, dateFin } = req.query;

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

        const query = {
            plante: planteId,
            utilisateur: req.user._id
        };

        // Validation des paramètres de pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
            return res.status(400).json({
                success: false,
                message: 'Paramètres de pagination invalides'
            });
        }

        // Filtrer par date
        if (dateDebut || dateFin) {
            query.date = {};
            if (dateDebut) {
                const dateDebutValid = new Date(dateDebut);
                if (isNaN(dateDebutValid)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Date de début invalide'
                    });
                }
                query.date.$gte = dateDebutValid;
            }
            if (dateFin) {
                const dateFinValid = new Date(dateFin);
                if (isNaN(dateFinValid)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Date de fin invalide'
                    });
                }
                query.date.$lte = dateFinValid;
            }
        }

        const [historiques, count] = await Promise.all([
            HistoriqueArrosage.find(query)
                .populate('plante', 'nom categorie')
                .populate('id_arrosage', 'type parametreUtilise')
                .sort({ date: -1 })
                .limit(limitNum)
                .skip((pageNum - 1) * limitNum)
                .lean(),
            HistoriqueArrosage.countDocuments(query)
        ]);

        if (historiques.length === 0 && pageNum > 1) {
            return res.status(404).json({
                success: false,
                message: 'Page non trouvée'
            });
        }

        res.json({
            success: true,
            historiques,
            totalPages: Math.ceil(count / limitNum),
            currentPage: pageNum,
            totalHistoriques: count
        });
    } catch (error) {
        console.error('Erreur récupération historique plante:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'historique'
        });
    }
};

// Obtenir les statistiques d'arrosage
const getStatistiques = async (req, res) => {
    try {
        const { dateDebut, dateFin } = req.query;
        const query = { utilisateur: req.user._id };

        // Ajout des filtres de date si spécifiés
        if (dateDebut || dateFin) {
            query.date = {};
            if (dateDebut) query.date.$gte = new Date(dateDebut);
            if (dateFin) query.date.$lte = new Date(dateFin);
        }

        const statistiques = await HistoriqueArrosage.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        plante: '$plante',
                        mois: { $month: '$date' },
                        annee: { $year: '$date' }
                    },
                    nombreArrosages: { $sum: 1 },
                    volumeTotalEau: { $sum: '$volumeEau' },
                    arrosagesAutomatiques: {
                        $sum: { $cond: [{ $eq: ['$type', 'automatique'] }, 1, 0] }
                    },
                    arrosagesManuels: {
                        $sum: { $cond: [{ $eq: ['$type', 'manuel'] }, 1, 0] }
                    },
                    humiditeMoyenne: {
                        $avg: '$parametresArrosage.humiditeSolRequise'
                    },
                    luminositeMoyenne: {
                        $avg: '$parametresArrosage.luminositeRequise'
                    }
                }
            },
            {
                $lookup: {
                    from: 'plantes',
                    localField: '_id.plante',
                    foreignField: '_id',
                    as: 'infoPlante'
                }
            },
            { $unwind: '$infoPlante' },
            {
                $project: {
                    plante: '$_id.plante',
                    nomPlante: '$infoPlante.nom',
                    categoriePlante: '$infoPlante.categorie',
                    mois: '$_id.mois',
                    annee: '$_id.annee',
                    nombreArrosages: 1,
                    volumeTotalEau: 1,
                    arrosagesAutomatiques: 1,
                    arrosagesManuels: 1,
                    humiditeMoyenne: { $round: ['$humiditeMoyenne', 2] },
                    luminositeMoyenne: { $round: ['$luminositeMoyenne', 2] }
                }
            },
            { $sort: { 'annee': -1, 'mois': -1, 'nomPlante': 1 } }
        ]);

        res.json({
            success: true,
            statistiques
        });
    } catch (error) {
        console.error('Erreur calcul statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du calcul des statistiques'
        });
    }
};

// Obtenir les statistiques par période
const getStatistiquesPeriode = async (req, res) => {
    try {
        const { periode } = req.params;
        const dateActuelle = new Date();
        let dateDebut;

        // Validation de la période
        if (!['semaine', 'mois'].includes(periode)) {
            return res.status(400).json({
                success: false,
                message: 'Période invalide. Utilisez "semaine" ou "mois"'
            });
        }

        // Définir la date de début selon la période
        dateDebut = new Date(dateActuelle);
        if (periode === 'semaine') {
            dateDebut.setDate(dateActuelle.getDate() - 7);
        } else {
            dateDebut.setMonth(dateActuelle.getMonth() - 1);
        }

        // Créer un tableau de toutes les dates de la période
        const toutesLesDates = [];
        let currentDate = new Date(dateDebut);
        while (currentDate <= dateActuelle) {
            toutesLesDates.push(
                periode === 'semaine' 
                    ? currentDate.toISOString().split('T')[0] 
                    : `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
            );
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const statistiques = await HistoriqueArrosage.aggregate([
            {
                $match: {
                    date: { $gte: dateDebut, $lte: dateActuelle }
                }
            },
            {
                $group: {
                    _id: {
                        plante: '$plante',
                        date: {
                            $dateToString: {
                                format: periode === 'semaine' ? '%Y-%m-%d' : '%Y-%m',
                                date: '$date'
                            }
                        }
                    },
                    volumeEauTotal: { $sum: '$volumeEau' },
                    humiditeSolMoyenne: { $avg: '$parametresArrosage.humiditeSolRequise' },
                    luminositeMoyenne: { $avg: '$parametresArrosage.luminositeRequise' },
                    nombreArrosages: { $sum: 1 },
                    arrosagesAutomatiques: {
                        $sum: { $cond: [{ $eq: ['$type', 'automatique'] }, 1, 0] }
                    },
                    arrosagesManuels: {
                        $sum: { $cond: [{ $eq: ['$type', 'manuel'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'plantes',
                    localField: '_id.plante',
                    foreignField: '_id',
                    as: 'plante'
                }
            },
            { $unwind: '$plante' },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    plante: '$_id.plante',
                    nomPlante: '$plante.nom',
                    categoriePlante: '$plante.categorie',
                    volumeEauTotal: { $round: ['$volumeEauTotal', 2] },
                    humiditeSolMoyenne: { $round: ['$humiditeSolMoyenne', 2] },
                    luminositeMoyenne: { $round: ['$luminositeMoyenne', 2] },
                    nombreArrosages: 1,
                    arrosagesAutomatiques: 1,
                    arrosagesManuels: 1
                }
            },
            { $sort: { date: 1, nomPlante: 1 } }
        ]);

        // Ajouter les dates manquantes avec des valeurs à 0
        const statistiquesCompletes = toutesLesDates.map(date => {
            const statsJour = statistiques.find(s => s.date === date);
            if (statsJour) return statsJour;
            return {
                date,
                volumeEauTotal: 0,
                humiditeSolMoyenne: 0,
                luminositeMoyenne: 0,
                nombreArrosages: 0,
                arrosagesAutomatiques: 0,
                arrosagesManuels: 0
            };
        });

        // Le reste de votre code pour le résumé et les totaux reste identique
        const resume = {
            periode: periode,
            dateDebut: dateDebut,
            dateFin: dateActuelle,
            totalArrosages: statistiques.reduce((sum, stat) => sum + stat.nombreArrosages, 0),
            totalEau: statistiques.reduce((sum, stat) => sum + stat.volumeEauTotal, 0)
        };

        const statsParPlante = statistiques.reduce((acc, stat) => {
            // Votre code existant pour statsParPlante
            return acc;
        }, {});

        const totaux = {
            totalPlantes: Object.keys(statsParPlante).length,
            totalArrosages: resume.totalArrosages,
            totalEau: resume.totalEau,
            totalAutomatiques: statistiques.reduce((sum, stat) => 
                sum + stat.arrosagesAutomatiques, 0),
            totalManuels: statistiques.reduce((sum, stat) => 
                sum + stat.arrosagesManuels, 0),
            moyenneHumidite: statistiques.reduce((sum, stat) => 
                sum + stat.humiditeSolMoyenne, 0) / statistiques.length || 0,
            moyenneLuminosite: statistiques.reduce((sum, stat) => 
                sum + stat.luminositeMoyenne, 0) / statistiques.length || 0
        };

        res.json({
            success: true,
            resume,
            statistiques: statistiquesCompletes,
            statsParPlante: Object.values(statsParPlante),
            totaux
        });

    } catch (error) {
        console.error(`Erreur statistiques ${periode}:`, error);
        res.status(500).json({
            success: false,
            message: `Erreur lors de la récupération des statistiques de la ${periode}`
        });
    }
};

// Supprimer un historique
const supprimerHistorique = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { historiqueId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(historiqueId)) {
            return res.status(400).json({
                success: false,
                message: 'ID d\'historique invalide'
            });
        }

        // Vérifier si l'historique existe et appartient à l'utilisateur
        const historique = await HistoriqueArrosage.findOne({
            _id: historiqueId,
            utilisateur: req.user._id
        }).session(session);

        if (!historique) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Historique non trouvé'
            });
        }

        await HistoriqueArrosage.findByIdAndDelete(historiqueId).session(session);
        await session.commitTransaction();

        res.json({
            success: true,
            message: 'Historique supprimé avec succès'
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Erreur suppression historique:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'historique'
        });
    } finally {
        session.endSession();
    }
};

// Exporter toutes les fonctions
module.exports = {
    creerHistoriqueArrosage,
    getHistoriqueComplet,
    getHistoriquePlante,
    getStatistiques,
    getStatistiquesPeriode,
    supprimerHistorique
};