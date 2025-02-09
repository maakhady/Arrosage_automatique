const express = require('express');
const router = express.Router();
const arrosageControleur = require('../controllers/arrosageControleur');
const auth = require('../middleware/auth');

// Routes protégées (nécessitent d'être authentifié)
router.post('/', auth, arrosageControleur.creerArrosage);
router.get('/mes-arrosages', auth, arrosageControleur.getMesArrosages);
router.get('/:id', auth, arrosageControleur.getArrosageParId);
router.put('/:id', auth, arrosageControleur.modifierArrosage);
router.delete('/:id', auth, arrosageControleur.supprimerArrosage);
router.patch('/:id/toggle', auth, arrosageControleur.toggleArrosage);
router.post('/manuel/:planteId', auth, arrosageControleur.arrosageManuelPlante);
router.post('/arret-urgence', auth, arrosageControleur.arreterArrosage);
router.post('/manuel-global', auth, arrosageControleur.arrosageManuelGlobal);

module.exports = router;