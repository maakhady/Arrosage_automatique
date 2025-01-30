const express = require('express');
const router = express.Router();
const historiqueArrosageController = require('../controllers/historiqueArrosageControleur');
const auth = require('../middleware/auth');
const { validateHistoriqueInputs, validateDateParams, validatePeriodeParam } = require('../middleware/validators/historiqueValidators');

// Routes
router.post('/', 
    auth,
    validateHistoriqueInputs,
    historiqueArrosageController.creerHistorique
);

router.get('/',
    auth,
    validateDateParams,
    historiqueArrosageController.getHistoriqueComplet
);

router.get('/plante/:planteId',
    auth,
    validateDateParams,
    historiqueArrosageController.getHistoriquePlante
);

router.get('/statistiques',
    auth,
    validateDateParams,
    historiqueArrosageController.getStatistiques
);

router.get('/statistiques/:periode',
    auth,
    validatePeriodeParam,
    historiqueArrosageController.getStatistiquesPeriode
);

router.delete('/:historiqueId',
    auth,
    historiqueArrosageController.supprimerHistorique
);

module.exports = router;