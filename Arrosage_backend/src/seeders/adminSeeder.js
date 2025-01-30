const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Utilisateur = require('../models/Utilisateur');
const config = require('../config/config');

mongoose.connect(config.MONGODB_URI)
    .then(() => console.log('Connexion à MongoDB établie pour le seeding'))
    .catch(err => console.error('Erreur de connexion MongoDB:', err));

const genererMatricule = async () => {
    let matriculeUnique = false;
    let matricule;
    let tentatives = 0;
    const maxTentatives = 50;

    while (!matriculeUnique && tentatives < maxTentatives) {
        const nombreAleatoire = Math.floor(1000 + Math.random() * 9000);
        matricule = `NAAT${nombreAleatoire}`;
        
        const utilisateurExistant = await Utilisateur.findOne({ matricule });
        
        if (!utilisateurExistant) {
            matriculeUnique = true;
        }
        
        tentatives++;
    }

    if (!matriculeUnique) {
        throw new Error('Impossible de générer une matricule unique après plusieurs tentatives');
    }

    return matricule;
};

const seedSuperAdmin = async () => {
    try {
        // Supprimer l'admin existant s'il existe
        await Utilisateur.deleteOne({ email: 'bintou@naatange.sn' });
        console.log('Ancien super-admin supprimé s\'il existait');

        const matricule = await genererMatricule();

        // Création d'abord sans hachage
        const superAdmin = new Utilisateur({
            matricule,
            nom: 'Sane',
            prenom: 'Fatou Bintou',
            email: 'bintou@naatange.sn',
            telephone: '777896325',
            code: '2002',               // Code non haché
            password: 'sane789@',       // Mot de passe non haché
            role: 'super-admin',
            actif: true,
            tokenVersion: 0
        });

        // Laisser le middleware du modèle gérer le hachage
        await superAdmin.save();

        console.log('Super-admin créé avec succès!');
        console.log('Informations du compte:');
        console.log(`Matricule: ${superAdmin.matricule}`);
        console.log('Email: bintou@naatange.sn');
        console.log('Code: 2002');
        console.log('Password: sane789@');

        await mongoose.connection.close();
        console.log('Connexion à MongoDB fermée');
        process.exit(0);
    } catch (error) {
        console.error('Erreur lors de la création du super-admin:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Exécuter le seeder
seedSuperAdmin();