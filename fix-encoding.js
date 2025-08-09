// Script pour corriger les problèmes d'encodage
import fs from 'fs';
import path from 'path';

// Fonction pour nettoyer les caractères spéciaux dans les commentaires
const cleanFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remplacer les caractères spéciaux français dans les commentaires par des équivalents ASCII
    const replacements = [
      // Accents dans les commentaires
      [/\/\/.*[àâäéèêëïîôöùûüÿç]/g, (match) => {
        return match
          .replace(/à/g, 'a').replace(/â/g, 'a').replace(/ä/g, 'a')
          .replace(/é/g, 'e').replace(/è/g, 'e').replace(/ê/g, 'e').replace(/ë/g, 'e')
          .replace(/ï/g, 'i').replace(/î/g, 'i')
          .replace(/ô/g, 'o').replace(/ö/g, 'o')
          .replace(/ù/g, 'u').replace(/û/g, 'u').replace(/ü/g, 'u')
          .replace(/ÿ/g, 'y').replace(/ç/g, 'c');
      }],
      // Guillemets spéciaux
      [/[""]/g, '"'],
      [/['']/g, "'"],
      // Points de suspension
      [/…/g, '...'],
      // Espaces insécables
      [/\u00A0/g, ' '],
      // Caractères de contrôle invisibles
      [/[\u200B-\u200D\uFEFF]/g, '']
    ];
    
    replacements.forEach(([pattern, replacement]) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Nettoyé: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return false;
  }
};

// Fonction pour parcourir récursivement les dossiers
const processDirectory = (dir) => {
  const files = fs.readdirSync(dir);
  let cleanedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      cleanedCount += processDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      if (cleanFile(filePath)) {
        cleanedCount++;
      }
    }
  }
  
  return cleanedCount;
};

console.log('🔧 Nettoyage des caractères spéciaux...\n');

// Traiter les dossiers principaux
const directories = ['./src', './api'];
let totalCleaned = 0;

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Traitement de ${dir}...`);
    const cleaned = processDirectory(dir);
    totalCleaned += cleaned;
    console.log(`   ${cleaned} fichiers nettoyés\n`);
  }
});

console.log(`🎉 Nettoyage terminé ! ${totalCleaned} fichiers modifiés.`);

// Vérifier les fichiers de configuration
const configFiles = [
  './vite.config.js',
  './tailwind.config.js',
  './postcss.config.js',
  './package.json'
];

console.log('\n🔍 Vérification des fichiers de configuration...');

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    if (cleanFile(file)) {
      console.log(`✅ ${file} nettoyé`);
    } else {
      console.log(`✅ ${file} déjà propre`);
    }
  }
});

console.log('\n📋 Prochaines étapes:');
console.log('1. npm run build');
console.log('2. git add . && git commit -m "Fix encoding issues"');
console.log('3. git push origin main'); 