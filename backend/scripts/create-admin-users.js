import User from '../models/User.js';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const admins = [
  {
    firstName: 'Super',
    lastName: 'Admin1',
    email: 'admin1@officielbenome.com',
    phoneNumber: '+229010000001',
    password: 'Admin123@2024',
    role: 'admin',
  },
  {
    firstName: 'Super',
    lastName: 'Admin2',
    email: 'admin2@officielbenome.com',
    phoneNumber: '+229010000002',
    password: 'Admin123@2024',
    role: 'admin',
  },
];

(async () => {
  try {
    await sequelize.authenticate();
    for (const admin of admins) {
      let user = await User.findOne({ where: { email: admin.email } });
      if (!user) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(admin.password, salt);
        user = await User.create({ ...admin, password: hashedPassword });
        console.log(`✅ Compte admin créé : ${admin.email}`);
      } else {
        user.role = 'admin';
        await user.save();
        console.log(`ℹ️  Utilisateur existant promu admin : ${admin.email}`);
      }
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création des comptes admin :', error);
    process.exit(1);
  }
})(); 