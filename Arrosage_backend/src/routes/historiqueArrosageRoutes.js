const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const historiqueController = require('../controllers/historiqueArrosageControleur');

// Application du middleware d'authentification pour toutes les routes
router.use(auth);

/**
 * @route GET /api/historique
 * @description Obtenir l'historique complet des arrosages avec pagination
 * @param {number} page - Numéro de page (défaut: 1)
 * @param {number} limit - Éléments par page (défaut: 10)
 * @param {string} dateDebut - Date début filtrage (YYYY-MM-DD)
 * @param {string} dateFin - Date fin filtrage (YYYY-MM-DD)
 * @access Privé
 */
router.get('/', historiqueController.getHistoriqueComplet);

/**
 * @route GET /api/historique/plante/:planteId
 * @description Obtenir l'historique d'une plante spécifique
 * @param {string} planteId - ID MongoDB de la plante
 * @param {number} page - Numéro de page (défaut: 1)
 * @param {number} limit - Éléments par page (défaut: 10)
 * @param {string} dateDebut - Date début filtrage (YYYY-MM-DD)
 * @param {string} dateFin - Date fin filtrage (YYYY-MM-DD)
 * @access Privé
 */
router.get('/plante/:planteId', historiqueController.getHistoriquePlante);

/**
 * @route GET /api/historique/statistiques
 * @description Obtenir les statistiques générales
 * @param {string} dateDebut - Date début (YYYY-MM-DD)
 * @param {string} dateFin - Date fin (YYYY-MM-DD)
 * @access Privé
 */
router.get('/statistiques', historiqueController.getStatistiques);

/**
 * @route GET /api/historique/statistiques/:periode
 * @description Obtenir les statistiques par période
 * @param {string} periode - 'semaine' ou 'mois'
 * @access Privé
 */
router.get('/statistiques/:periode', historiqueController.getStatistiquesPeriode);

/**
 * @route DELETE /api/historique/:historiqueId
 * @description Supprimer un historique
 * @param {string} historiqueId - ID MongoDB de l'historique
 * @access Privé
 */
router.delete('/:historiqueId', historiqueController.supprimerHistorique);

module.exports = router;