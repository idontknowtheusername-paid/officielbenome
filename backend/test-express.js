console.log('🚀 Test Express...');

import express from 'express';

console.log('✅ Express importé avec succès');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Express fonctionne !' });
});

console.log('🌐 Démarrage du serveur Express...');

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur Express démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

console.log('🎯 Test Express terminé'); 