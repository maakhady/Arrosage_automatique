const express = require('express');
const router = express.Router();
const planteControleur = require('../controllers/planteControleur');
const auth = require('../middleware/auth');

// Toutes les routes nécessitent simplement d'être authentifié
router.post('/', 
    auth, 
    planteControleur.creerPlante
);

router.get('/', 
    auth, 
    planteControleur.getToutesPlantes
);

router.get('/:id', 
    auth, 
    planteControleur.getPlanteParId
);

router.put('/:id', 
    auth, 
    planteControleur.modifierPlante
);

router.delete('/:id', 
    auth, 
    planteControleur.supprimerPlante
);

router.delete('/', 
    auth, 
    planteControleur.supprimerPlante  // Pour la suppression multiple
);

router.get('/categorie/:categorie', 
    auth, 
    planteControleur.rechercherParCategorie
);

module.exports = router;