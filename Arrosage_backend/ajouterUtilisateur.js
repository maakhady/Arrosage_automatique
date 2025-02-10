const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Utilisateur = require('./src/models/Utilisateur'); // Assure-toi que le modèle est correct
const config = require('./src/config/config');

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const creerUtilisateur = async () => {
    try {
        const passwordHash = await bcrypt.hash("dieng123", 10); // Remplace par un vrai mot de passe

        const nouvelUtilisateur = new Utilisateur({
            matricule: "U12345",
            nom: "Doe",
            prenom: "John",
            email: "john.doe@example.com",
            password: passwordHash, // Mot de passe sécurisé
            role: "super-admin",
            actif: true,
            code: "1234",
            cardId: "ABC123XYZ"
        });

        await nouvelUtilisateur.save();
        console.log("Utilisateur créé avec succès !");
        mongoose.connection.close();
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur :", error);
        mongoose.connection.close();
    }
};

creerUtilisateur();
