// Script de migration (exemple Sequelize)
import sequelize from '../config/database.js';

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Migrations terminées');
    process.exit(0);
  } catch (err) {
    console.error('Erreur migration:', err);
    process.exit(1);
  }
})();
