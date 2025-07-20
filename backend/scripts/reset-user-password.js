import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import sequelize from '../config/database.js';

/**
 * Script pour réinitialiser le mot de passe d'un utilisateur
 * Usage: node scripts/reset-user-password.js <email> <nouveau_mot_de_passe>
 */

const resetUserPassword = async (email, newPassword) => {
  try {
    // Se connecter à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // Trouver l'utilisateur
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.error('❌ Utilisateur non trouvé avec cet email:', email);
      process.exit(1);
    }

    console.log('✅ Utilisateur trouvé:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour l'utilisateur
    await user.update({ password: hashedPassword });

    console.log('✅ Mot de passe mis à jour avec succès');
    console.log('📧 Email:', email);
    console.log('🔑 Nouveau mot de passe:', newPassword);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

// Récupérer les arguments de ligne de commande
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('Usage: node scripts/reset-user-password.js <email> <nouveau_mot_de_passe>');
  console.log('Exemple: node scripts/reset-user-password.js test@gmail.com "NouveauMotDePasse123!"');
  process.exit(1);
}

const [email, newPassword] = args;

// Valider le mot de passe
if (newPassword.length < 8) {
  console.error('❌ Le mot de passe doit contenir au moins 8 caractères');
  process.exit(1);
}

console.log('🔄 Réinitialisation du mot de passe...');
resetUserPassword(email, newPassword); 