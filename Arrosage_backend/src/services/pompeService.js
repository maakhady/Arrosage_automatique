const axios = require('axios');
const RASPBERRY_URL = 'http://192.168.40.21:5000';

const pompeService = {
    demarrerArrosageManuel: async () => {
        try {
            const response = await axios.post(`${RASPBERRY_URL}/api/arrosage/manuel/global`);
            console.log('Arrosage manuel démarré:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erreur démarrage arrosage manuel:', error);
            throw error;
        }
    },

    arreterArrosage: async () => {
        try {
            const response = await axios.post(`${RASPBERRY_URL}/api/arrosage/stop`);
            console.log('Arrosage arrêté:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erreur arrêt arrosage:', error);
            throw error;
        }
    }
};

module.exports = pompeService;