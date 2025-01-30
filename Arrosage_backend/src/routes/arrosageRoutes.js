const express = require('express');
const router = express.Router();
const arrosageControleur = require('../controllers/arrosageControleur');
const auth = require('../middleware/auth');

// Routes pour l'arrosage manuel
router.post('/manuel/plante/:planteId', 
   auth, 
   arrosageControleur.arrosageManuelPlante
);

router.post('/manuel/global', 
   auth, 
   arrosageControleur.arrosageManuelGlobal
);

router.post('/stop', 
   auth, 
   arrosageControleur.arreterArrosage
);

// Routes pour la programmation d'arrosage
router.post('/', 
   auth, 
   arrosageControleur.creerArrosage
);

router.get('/', 
   auth, 
   arrosageControleur.getMesArrosages
);

router.get('/:id', 
   auth, 
   arrosageControleur.getArrosageParId
);

router.put('/:id', 
   auth, 
   arrosageControleur.modifierArrosage
);

router.delete('/:id', 
   auth, 
   arrosageControleur.supprimerArrosage
);

// Route pour activer/désactiver un arrosage programmé
router.patch('/:id/toggle', 
   auth, 
   arrosageControleur.toggleArrosage
);

module.exports = router;