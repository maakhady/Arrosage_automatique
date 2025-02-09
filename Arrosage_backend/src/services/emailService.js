const transporter = require('../config/emailConfig');

class EmailService {
    static async sendUserCredentials(userData) {
        try {
            // Logs pour débugger
            console.log('=== Debug EmailService ===');
            console.log('Code reçu dans EmailService:', userData.code);
            console.log('Données utilisateur complètes:', userData);

            const mailOptions = {
                from: `"NAATANGÉ (Arrosage Intelligent)" <${process.env.EMAIL_USER}>`,
                to: userData.email,
                subject: 'Vos informations de compte Pour la  plateforme - NAATANGÉ (Arrosage Intelligent)',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #50A24C;">Bienvenue sur Arrosage Intelligent !</h2>
                        
                        <p>Bonjour ${userData.prenom} ${userData.nom},</p>
                        <p>Votre compte a été créé avec succès. Voici vos informations de connexion :</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Prénom :</strong> ${userData.prenom}</p>
                            <p><strong>Nom :</strong> ${userData.nom}</p>
                            <p><strong>Matricule :</strong> ${userData.matricule}</p>
                            <p><strong>Email :</strong> ${userData.email}</p>
                            <p><strong>Code de connexion :</strong> ${userData.code}</p>
                            <p><strong>Rôle :</strong> ${userData.role}</p>
                        </div>

                        // <p style="color: #e74c3c;"><strong>Important :</strong> Pour des raisons de sécurité, nous vous recommandons de changer votre code dès votre première connexion.</p>
                        
                        <p>Pour vous connecter, utilisez  le code fourni ci-dessus.</p>
                        
                        <p style="margin-top: 30px;">Cordialement,<br>L'équipe Arrosage Intelligent "NAATANGÉÉ"</p>
                    </div>
                `
            };

            console.log('Code utilisé dans le template email:', userData.code);

            const info = await transporter.sendMail(mailOptions);
            console.log('Email envoyé avec succès:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            throw error;
        }
    }
}

module.exports = EmailService;