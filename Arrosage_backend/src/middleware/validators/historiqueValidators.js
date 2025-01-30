const mongoose = require('mongoose');

/**
 * Validation des entrées pour la création d'historique
 */
const validateHistoriqueInputs = (req, res, next) => {
    const { id_arrosage } = req.body;

    if (!id_arrosage) {
        return res.status(400).json({
            success: false,
            message: 'L\'ID d\'arrosage est requis'
        });
    }

    if (!mongoose.Types.ObjectId.isValid(id_arrosage)) {
        return res.status(400).json({
            success: false,
            message: 'Format d\'ID d\'arrosage invalide'
        });
    }

    next();
};

/**
 * Validation des paramètres de date
 */
const validateDateParams = (req, res, next) => {
    const { dateDebut, dateFin } = req.query;

    if (dateDebut) {
        const dateDebutValid = new Date(dateDebut);
        if (isNaN(dateDebutValid)) {
            return res.status(400).json({
                success: false,
                message: 'Format de date de début invalide'
            });
        }
    }

    if (dateFin) {
        const dateFinValid = new Date(dateFin);
        if (isNaN(dateFinValid)) {
            return res.status(400).json({
                success: false,
                message: 'Format de date de fin invalide'
            });
        }
    }

    if (dateDebut && dateFin) {
        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        if (debut > fin) {
            return res.status(400).json({
                success: false,
                message: 'La date de début doit être antérieure à la date de fin'
            });
        }
    }

    next();
};

/**
 * Validation du paramètre période
 */
const validatePeriodeParam = (req, res, next) => {
    const { periode } = req.params;
    const periodesValides = ['semaine', 'mois'];

    if (!periodesValides.includes(periode)) {
        return res.status(400).json({
            success: false,
            message: 'Période invalide. Utilisez "semaine" ou "mois"'
        });
    }

    next();
};

module.exports = {
    validateHistoriqueInputs,
    validateDateParams,
    validatePeriodeParam
};