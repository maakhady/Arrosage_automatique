const cron = require('node-cron');
const axios = require('axios');
const Arrosage = require('./src/models/Arrosage'); // Ajustez le chemin selon votre structure

const startScheduler = () => {
    console.log('Démarrage du planificateur d\'arrosage');

    // Vérifie toutes les minutes
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            console.log(`Vérification des arrosages programmés à ${currentHour}:${currentMinute}`);

            // Trouver les arrosages qui doivent démarrer maintenant
            const arrosagesADemarrer = await Arrosage.find({
                actif: true,
                type: 'automatique',
                'heureDebut.heures': currentHour,
                'heureDebut.minutes': currentMinute
            }).populate('plante');

            console.log('Arrosages à démarrer:', arrosagesADemarrer);

            // Trouver les arrosages qui doivent s'arrêter maintenant
            const arrosagesAArreter = await Arrosage.find({
                actif: true,
                type: 'automatique',
                'heureFin.heures': currentHour,
                'heureFin.minutes': currentMinute
            }).populate('plante');

            console.log('Arrosages à arrêter:', arrosagesAArreter);

            // S'il y a des arrosages à démarrer
            if (arrosagesADemarrer.length > 0) {
                try {
                    const response = await axios.post('http://192.168.40.21:5000/api/arrosage/manuel/global', {}, {
                        headers: {
                            'Authorization': 'Bearer VOTRE_TOKEN_AUTHENTIFICATION'
                        }
                    });
                    console.log('Commande de démarrage envoyée avec succès:', response.data);
                } catch (error) {
                    console.error('Erreur lors du démarrage de l\'arrosage:', error.response ? error.response.data : error.message);
                }
            }

            // S'il y a des arrosages à arrêter
            if (arrosagesAArreter.length > 0) {
                try {
                    const response = await axios.post('http://192.168.40.21:5000/api/arrosage/stop', {}, {
                        headers: {
                            'Authorization': 'Bearer VOTRE_TOKEN_AUTHENTIFICATION'
                        }
                    });
                    console.log('Commande d\'arrêt envoyée avec succès:', response.data);
                } catch (error) {
                    console.error('Erreur lors de l\'arrêt de l\'arrosage:', error.response ? error.response.data : error.message);
                }
            }

        } catch (error) {
            console.error('Erreur dans le scheduler:', error);
        }
    });
};

module.exports = startScheduler;
