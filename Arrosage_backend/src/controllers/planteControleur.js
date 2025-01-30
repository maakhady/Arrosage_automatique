const Plante = require('../models/Plante');

// Créer une nouvelle plante
const creerPlante = async (req, res) => {
    try {
        const { nom, categorie, humiditeSol, volumeEau, luminosite } = req.body;

        // Vérification des données requises
        if (!nom || !categorie || !humiditeSol || !volumeEau || !luminosite) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis'
            });
        }

        // Création de la nouvelle plante
        const nouvellePlante = new Plante({
            nom,
            categorie,
            humiditeSol,
            volumeEau,
            luminosite
        });

        await nouvellePlante.save();

        res.status(201).json({
            success: true,
            message: 'Plante créée avec succès',
            plante: nouvellePlante
        });
    } catch (error) {
        console.error('Erreur création plante:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la plante'
        });
    }
};

// Récupérer toutes les plantes
const getToutesPlantes = async (req, res) => {
    try {
        const plantes = await Plante.find().sort({ nom: 1 });

        res.json({
            success: true,
            count: plantes.length,
            plantes
        });
    } catch (error) {
        console.error('Erreur récupération plantes:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des plantes'
        });
    }
};

// Récupérer une plante par ID
const getPlanteParId = async (req, res) => {
    try {
        const plante = await Plante.findById(req.params.id);

        if (!plante) {
            return res.status(404).json({
                success: false,
                message: 'Plante non trouvée'
            });
        }

        res.json({
            success: true,
            plante
        });
    } catch (error) {
        console.error('Erreur récupération plante:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la plante'
        });
    }
};

// Modifier une plante
const modifierPlante = async (req, res) => {
    try {
        const { nom, categorie, humiditeSol, volumeEau, luminosite } = req.body;
        const updates = {};

        // Construction de l'objet de mise à jour
        if (nom) updates.nom = nom;
        if (categorie) updates.categorie = categorie;
        if (humiditeSol !== undefined) updates.humiditeSol = humiditeSol;
        if (volumeEau !== undefined) updates.volumeEau = volumeEau;
        if (luminosite !== undefined) updates.luminosite = luminosite;

        updates.date_modification = Date.now();

        const plante = await Plante.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!plante) {
            return res.status(404).json({
                success: false,
                message: 'Plante non trouvée'
            });
        }

        res.json({
            success: true,
            message: 'Plante modifiée avec succès',
            plante
        });
    } catch (error) {
        console.error('Erreur modification plante:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de la plante'
        });
    }
};

// Supprimer une ou plusieurs plantes
const supprimerPlante = async (req, res) => {
    try {
        const { ids } = req.body;
        const idUnique = req.params.id;

        // Suppression multiple
        if (ids && Array.isArray(ids)) {
            const resultat = await Plante.deleteMany({
                _id: { $in: ids }
            });

            if (resultat.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Aucune plante n\'a été supprimée'
                });
            }

            return res.json({
                success: true,
                message: `${resultat.deletedCount} plante(s) supprimée(s) avec succès`
            });
        }

        // Suppression unique
        if (idUnique) {
            const plante = await Plante.findByIdAndDelete(idUnique);

            if (!plante) {
                return res.status(404).json({
                    success: false,
                    message: 'Plante non trouvée'
                });
            }

            return res.json({
                success: true,
                message: 'Plante supprimée avec succès'
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Veuillez fournir un ID ou un tableau d\'IDs à supprimer'
        });

    } catch (error) {
        console.error('Erreur suppression plante(s):', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la/des plante(s)'
        });
    }
};

// Rechercher des plantes par catégorie
const rechercherParCategorie = async (req, res) => {
    try {
        const { categorie } = req.params;

        const plantes = await Plante.find({ 
            categorie: new RegExp(categorie, 'i') 
        }).sort({ nom: 1 });

        res.json({
            success: true,
            count: plantes.length,
            plantes
        });
    } catch (error) {
        console.error('Erreur recherche plantes:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche des plantes'
        });
    }
};

module.exports = {
    creerPlante,
    getToutesPlantes,
    getPlanteParId,
    modifierPlante,
    supprimerPlante,
    rechercherParCategorie
};