const express = require('express');
const router = express.Router();
const authControleur = require('../controllers/authControleur');

const auth = require('../middleware/auth');
const verifRole = require('../middleware/verifRole');


// Routes publiques (ne nécessitent pas d'authentification)
router.post('/login/code', authControleur.loginAvecCode);
router.post('/login/rfid', authControleur.loginAvecRFID);
router.post('/login/email', authControleur.loginAvecEmail);


// Routes protégées (nécessitent d'être authentifié)
router.get('/verifier', auth, authControleur.verifierAuth);

// Route pour vérifier une carte RFID (super-admin uniquement)
router.post('/verifier-rfid', auth, verifRole(['super-admin']), authControleur.verifierRFID);

// Déconnexion de la session courante
router.post('/logout', auth, authControleur.logout);

// Déconnexion de toutes les sessions
router.post('/logout-all', auth, authControleur.logoutAll);

module.exports = router;