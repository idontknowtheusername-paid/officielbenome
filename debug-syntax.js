// Script pour identifier les erreurs de syntaxe
import fs from 'fs';
import path from 'path';

const checkFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Essayer de parser le contenu
    new Function(content);
    return { file: filePath, error: null };
  } catch (error) {
    return { file: filePath, error: error.message };
  }
};

const checkDirectory = (dir) => {
  const files = fs.readdirSync(dir);
  const results = [];
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results.push(...checkDirectory(filePath));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(checkFile(filePath));
    }
  }
  
  return results;
};

console.log('🔍 Vérification de la syntaxe des fichiers JavaScript...\n');

const results = checkDirectory('./src');
const errors = results.filter(r => r.error);

if (errors.length > 0) {
  console.log('❌ Erreurs de syntaxe détectées :');
  errors.forEach(({ file, error }) => {
    console.log(`\n📁 ${file}`);
    console.log(`   Erreur: ${error}`);
  });
} else {
  console.log('✅ Aucune erreur de syntaxe détectée dans les fichiers source');
}

// Vérifier aussi les fichiers de configuration
const configFiles = [
  './vite.config.js',
  './tailwind.config.js',
  './postcss.config.js'
];

console.log('\n🔍 Vérification des fichiers de configuration...');

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const result = checkFile(file);
    if (result.error) {
      console.log(`❌ ${file}: ${result.error}`);
    } else {
      console.log(`✅ ${file}: OK`);
    }
  }
}); 