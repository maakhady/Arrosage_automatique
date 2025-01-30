const HistoriqueArrosage = require('../models/HistoriqueArrosage');
const Plante = require('../models/Plante');
const Arrosage = require('../models/Arrosage');
const mongoose = require('mongoose');

// Créer un nouvel enregistrement dans l'historique
const creerHistorique = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id_arrosage } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id_arrosage)) {
            return res.status(400).json({
                success: false,
                message: 'ID d\'arrosage invalide'
            });
        }

        // Vérifier si l'arrosage existe et récupérer ses informations
        const arrosage = await Arrosage.findById(id_arrosage).session(session);
        if (!arrosage) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Arrosage non trouvé'
            });
        }

        // Vérifier si la plante existe
        const plante = await Plante.findById(arrosage.plante).session(session);
        if (!plante) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Plante non trouvée'
            });
        }

        // Vérifier si un historique existe déjà pour cet arrosage
        const historiqueExistant = await HistoriqueArrosage.findOne({ 
            id_arrosage: id_arrosage 
        }).session(session);

        if (historiqueExistant) {
            await session.abortTransaction();
            return res.status(409).json({
                success: false,
                message: 'Un historique existe déjà pour cet arrosage'
            });
        }

        // Créer l'historique à partir des données de l'arrosage
        const historique = new HistoriqueArrosage({
            plante: arrosage.plante,
            utilisateur: req.user._id,
            type: arrosage.type,
            volumeEau: arrosage.volumeEau,
            humiditeSol: arrosage.humiditeSol,
            luminosite: arrosage.luminosite,
            parametreUtilise: arrosage.parametreUtilise,
            id_arrosage: id_arrosage
        });

        await historique.save({ session });
        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: 'Historique créé avec succès',
            historique
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Erreur création historique:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'historique'
        });
    } finally {
        session.endSession();
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

        // Validation des dates
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
                    humiditeMoyenne: { $avg: '$humiditeSol' },
                    luminositeMoyenne: { $avg: '$luminosite' }
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
            { 
                $unwind: {
                    path: '$infoPlante',
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $project: {
                    _id: 0,
                    plante: '$_id.plante',
                    nomPlante: '$infoPlante.nom',
                    categoriePlante: '$infoPlante.categorie',
                    mois: '$_id.mois',
                    annee: '$_id.annee',
                    nombreArrosages: 1,
                    volumeTotalEau: 1,
                    humiditeMoyenne: { $round: ['$humiditeMoyenne', 2] },
                    luminositeMoyenne: { $round: ['$luminositeMoyenne', 2] }
                }
            },
            { 
                $sort: { 
                    'annee': -1, 
                    'mois': -1,
                    'nomPlante': 1
                } 
            }
        ]);

        // Calculer les totaux globaux
        const totaux = statistiques.reduce((acc, stat) => {
            acc.nombreTotalArrosages += stat.nombreArrosages;
            acc.volumeTotalEau += stat.volumeTotalEau;
            acc.humiditeMoyenneGlobale += stat.humiditeMoyenne;
            acc.luminositeMoyenneGlobale += stat.luminositeMoyenne;
            return acc;
        }, {
            nombreTotalArrosages: 0,
            volumeTotalEau: 0,
            humiditeMoyenneGlobale: 0,
            luminositeMoyenneGlobale: 0
        });

        if (statistiques.length > 0) {
            totaux.humiditeMoyenneGlobale = Number((totaux.humiditeMoyenneGlobale / statistiques.length).toFixed(2));
            totaux.luminositeMoyenneGlobale = Number((totaux.luminositeMoyenneGlobale / statistiques.length).toFixed(2));
        }

        res.json({
            success: true,
            statistiques,
            totaux
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

        const statistiques = await HistoriqueArrosage.aggregate([
            {
                $match: {
                    utilisateur: req.user._id,
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
                    humiditeSolMoyenne: { $avg: '$humiditeSol' },
                    luminositeMoyenne: { $avg: '$luminosite' },
                    nombreArrosages: { $sum: 1 }
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
            { 
                $unwind: {
                    path: '$plante',
                    preserveNullAndEmptyArrays: false
                }
            },
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
                    nombreArrosages: 1
                }
            },
            {
                $sort: { 
                    date: 1,
                    nomPlante: 1
                }
            }
        ]);

        if (statistiques.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Aucune donnée trouvée pour la ${periode}`
            });
        }

        // Calculer les totaux et moyennes globales
        const totaux = {
            volumeEauTotal: 0,
            humiditeSolMoyenne: 0,
            luminositeMoyenne: 0,
            nombreTotalArrosages: 0
        };

        statistiques.forEach(stat => {
            totaux.volumeEauTotal += stat.volumeEauTotal;
            totaux.humiditeSolMoyenne += stat.humiditeSolMoyenne;
            totaux.luminositeMoyenne += stat.luminositeMoyenne;
            totaux.nombreTotalArrosages += stat.nombreArrosages;
        });

        // Calculer les moyennes
        if (statistiques.length > 0) {
            totaux.humiditeSolMoyenne = Number((totaux.humiditeSolMoyenne / statistiques.length).toFixed(2));
            totaux.luminositeMoyenne = Number((totaux.luminositeMoyenne / statistiques.length).toFixed(2));
            totaux.volumeEauTotal = Number(totaux.volumeEauTotal.toFixed(2));
        }

        // Ajouter des statistiques supplémentaires
        const statsParPlante = {};
        statistiques.forEach(stat => {
            if (!statsParPlante[stat.nomPlante]) {
                statsParPlante[stat.nomPlante] = {
                    nombreArrosages: 0,
                    volumeEauTotal: 0,
                    humiditeMoyenne: 0,
                    luminositeMoyenne: 0,
                    occurrences: 0
                };
            }
            
            const planteStat = statsParPlante[stat.nomPlante];
            planteStat.nombreArrosages += stat.nombreArrosages;
            planteStat.volumeEauTotal += stat.volumeEauTotal;
            planteStat.humiditeMoyenne += stat.humiditeSolMoyenne;
            planteStat.luminositeMoyenne += stat.luminositeMoyenne;
            planteStat.occurrences++;
        });

        // Calculer les moyennes par plante
        Object.keys(statsParPlante).forEach(plante => {
            const stat = statsParPlante[plante];
            stat.humiditeMoyenne = Number((stat.humiditeMoyenne / stat.occurrences).toFixed(2));
            stat.luminositeMoyenne = Number((stat.luminositeMoyenne / stat.occurrences).toFixed(2));
            stat.volumeEauTotal = Number(stat.volumeEauTotal.toFixed(2));
            delete stat.occurrences;
        });

        // Préparer le résumé de la période
        const resume = {
            periode,
            dateDebut,
            dateFin: dateActuelle,
            nombreJours: Math.ceil((dateActuelle - dateDebut) / (1000 * 60 * 60 * 24)),
            moyenneArrosagesParJour: Number((totaux.nombreTotalArrosages / Math.ceil((dateActuelle - dateDebut) / (1000 * 60 * 60 * 24))).toFixed(2))
        };

        res.json({
            success: true,
            resume,
            statistiques,
            statsParPlante,
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

module.exports = {
    creerHistorique,
    getHistoriqueComplet,
    getHistoriquePlante,
    getStatistiques,
    getStatistiquesPeriode,
    supprimerHistorique
};