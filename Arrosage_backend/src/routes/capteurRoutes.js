const express = require('express');
const router = express.Router();
const capteurService = require('../services/capteurService');

router.get('/lecture', (req, res) => {
    res.json(capteurService.getDerniereLecture());
});

module.exports = router;