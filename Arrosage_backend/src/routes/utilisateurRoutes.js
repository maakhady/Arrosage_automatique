const express = require('express');
const router = express.Router();
const utilisateurControleur = require('../controllers/utilisateurControleur');
const auth = require('../middleware/auth');
const verifRole = require('../middleware/verifRole');

// Toutes les routes nécessitent d'être super-admin
const superAdminMiddleware = [auth, verifRole(['super-admin'])];

// Route pour créer un nouvel utilisateur
router.post('/', 
    superAdminMiddleware, 
    utilisateurControleur.creerUtilisateur
);

// Route pour récupérer tous les utilisateurs
router.get('/', 
    superAdminMiddleware, 
    utilisateurControleur.getTousUtilisateurs
);

// Route pour récupérer un utilisateur par ID
router.get('/:id', 
    superAdminMiddleware, 
    utilisateurControleur.getUtilisateurParId
);

// Route pour modifier un utilisateur
router.put('/:id', 
    superAdminMiddleware, 
    utilisateurControleur.modifierUtilisateur
);

// Routes pour la suppression
router.delete('/:id', 
    superAdminMiddleware, 
    utilisateurControleur.supprimerUtilisateur
);

router.delete('/', 
    superAdminMiddleware, 
    utilisateurControleur.supprimerUtilisateur
); // Pour la suppression multiple

// Route pour assigner une carte RFID
router.post('/:id/rfid', 
    superAdminMiddleware, 
    utilisateurControleur.assignerCarteRFID
);


// Route pour désassigner une carte RFID
router.delete('/:id/rfid', 
    superAdminMiddleware, 
    utilisateurControleur.desassignerCarteRFID
);


// Route pour l'import CSV
router.post('/import-csv', 
    superAdminMiddleware, 
    utilisateurControleur.importerUtilisateursCSV
);


// Route pour activer/désactiver un utilisateur
router.patch('/:id/toggle-activation', 
    superAdminMiddleware, 
    utilisateurControleur.toggleActivationUtilisateur
);

module.exports = router;