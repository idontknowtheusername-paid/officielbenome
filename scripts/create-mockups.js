#!/usr/bin/env node

/**
 * 🎨 Script de Création Automatique de Mockups MaxiMarket
 * 
 * Ce script automatise la création de mockups pour les réseaux sociaux
 * en utilisant des templates prédéfinis et des assets organisés.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des réseaux sociaux
const SOCIAL_PLATFORMS = {
  instagram: {
    name: 'Instagram',
    dimensions: { width: 1080, height: 1080 },
    formats: ['post', 'story', 'carousel'],
    hashtags: ['#MaxiMarket', '#Marketplace', '#Afrique', '#Ecommerce', '#Immobilier', '#Automobile', '#Business']
  },
  facebook: {
    name: 'Facebook',
    dimensions: { width: 1200, height: 630 },
    formats: ['post', 'cover', 'story'],
    hashtags: ['#MaxiMarket', '#Marketplace', '#Afrique', '#Ecommerce']
  },
  linkedin: {
    name: 'LinkedIn',
    dimensions: { width: 1200, height: 627 },
    formats: ['post', 'cover', 'article'],
    hashtags: ['#Innovation', '#Afrique', '#Ecommerce', '#MaxiMarket', '#DigitalTransformation']
  },
  twitter: {
    name: 'Twitter',
    dimensions: { width: 1200, height: 675 },
    formats: ['tweet', 'header'],
    hashtags: ['#MaxiMarket', '#Marketplace', '#Afrique']
  }
};

// Templates de contenu
const CONTENT_TEMPLATES = {
  product_showcase: {
    title: '🏠 Découvrez MaxiMarket',
    subtitle: 'La marketplace N°1 en Afrique de l\'Ouest',
    features: ['✅ Achetez en sécurité', '✅ Vendez facilement', '✅ Payez en toute confiance'],
    cta: '📱 Téléchargez l\'app !'
  },
  testimonial: {
    title: '💬 Témoignage Client',
    subtitle: '"J\'ai vendu ma voiture en 2 jours !"',
    author: '- Aminata, Dakar',
    cta: '👇 Partagez votre expérience'
  },
  business_insights: {
    title: '💼 Transformation Digitale',
    subtitle: 'MaxiMarket révolutionne le commerce en ligne',
    stats: ['📊 +150% de croissance', '🌍 Présence dans 5 pays', '💳 Paiements locaux'],
    cta: '🌐 maxiimarket.com'
  },
  feature_highlight: {
    title: '🚀 Nouvelle Fonctionnalité',
    subtitle: 'Messagerie en temps réel',
    features: ['💬 Chat instantané', '📱 Notifications push', '🔒 Messages sécurisés'],
    cta: '👆 Testez maintenant !'
  }
};

// Couleurs de marque MaxiMarket
const BRAND_COLORS = {
  primary: '#2563eb',
  secondary: '#f59e0b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  dark: '#1f2937',
  light: '#f9fafb'
};

class MockupGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../mockups');
    this.assetsDir = path.join(__dirname, '../assets');
    this.templatesDir = path.join(__dirname, '../templates');
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [this.outputDir, this.assetsDir, this.templatesDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Créé le dossier: ${dir}`);
      }
    });
  }

  /**
   * Génère un mockup pour une plateforme spécifique
   */
  generateMockup(platform, template, options = {}) {
    const config = SOCIAL_PLATFORMS[platform];
    if (!config) {
      throw new Error(`Plateforme non supportée: ${platform}`);
    }

    const content = CONTENT_TEMPLATES[template];
    if (!content) {
      throw new Error(`Template non trouvé: ${template}`);
    }

    const mockupData = {
      platform,
      dimensions: config.dimensions,
      content,
      colors: BRAND_COLORS,
      hashtags: config.hashtags,
      ...options
    };

    return this.createMockupFile(mockupData);
  }

  /**
   * Crée le fichier de mockup
   */
  createMockupFile(mockupData) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `mockup-${mockupData.platform}-${timestamp}.json`;
    const filepath = path.join(this.outputDir, filename);

    const mockupContent = {
      metadata: {
        created: new Date().toISOString(),
        platform: mockupData.platform,
        template: mockupData.template || 'unknown',
        dimensions: mockupData.dimensions
      },
      design: {
        colors: mockupData.colors,
        content: mockupData.content,
        hashtags: mockupData.hashtags
      },
      instructions: this.generateInstructions(mockupData)
    };

    fs.writeFileSync(filepath, JSON.stringify(mockupContent, null, 2));
    console.log(`✅ Mockup créé: ${filename}`);
    
    return filepath;
  }

  /**
   * Génère les instructions de création
   */
  generateInstructions(mockupData) {
    const { platform, dimensions, content } = mockupData;
    
    return {
      tool: 'Canva ou Figma',
      steps: [
        `1. Créer un nouveau design ${dimensions.width}x${dimensions.height}px`,
        `2. Appliquer le fond: gradient ${BRAND_COLORS.primary} vers ${BRAND_COLORS.secondary}`,
        `3. Ajouter le titre: "${content.title}"`,
        `4. Ajouter le sous-titre: "${content.subtitle}"`,
        `5. Intégrer le mockup d'appareil (iPhone/MacBook)`,
        `6. Ajouter les features: ${content.features?.join(', ')}`,
        `7. Ajouter le CTA: "${content.cta}"`,
        `8. Ajouter les hashtags: ${mockupData.hashtags.join(' ')}`,
        `9. Exporter en PNG haute qualité`
      ],
      assets: [
        'logo-maximarket.png',
        'mockup-iphone.png',
        'mockup-macbook.png',
        'screenshot-app.png'
      ]
    };
  }

  /**
   * Génère un batch de mockups pour toutes les plateformes
   */
  generateBatch(template, options = {}) {
    console.log(`🚀 Génération de mockups pour le template: ${template}`);
    
    const results = [];
    Object.keys(SOCIAL_PLATFORMS).forEach(platform => {
      try {
        const filepath = this.generateMockup(platform, template, options);
        results.push({ platform, filepath, success: true });
      } catch (error) {
        console.error(`❌ Erreur pour ${platform}:`, error.message);
        results.push({ platform, error: error.message, success: false });
      }
    });

    return results;
  }

  /**
   * Crée un calendrier de contenu
   */
  generateContentCalendar(weeks = 4) {
    const calendar = [];
    const templates = Object.keys(CONTENT_TEMPLATES);
    const platforms = Object.keys(SOCIAL_PLATFORMS);

    for (let week = 1; week <= weeks; week++) {
      const weekPlan = {
        week,
        posts: []
      };

      // Plan hebdomadaire
      const weeklyTemplates = [
        'product_showcase',    // Lundi
        'feature_highlight',   // Mardi
        'testimonial',         // Mercredi
        'business_insights',   // Jeudi
        'product_showcase',    // Vendredi
        'testimonial',         // Samedi
        'business_insights'    // Dimanche
      ];

      weeklyTemplates.forEach((template, dayIndex) => {
        const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const day = dayNames[dayIndex];
        
        // Sélectionner les plateformes appropriées
        let targetPlatforms;
        switch (dayIndex) {
          case 0: // Lundi - Motivation
            targetPlatforms = ['instagram', 'linkedin'];
            break;
          case 1: // Mardi - Éducatif
            targetPlatforms = ['instagram', 'facebook'];
            break;
          case 2: // Mercredi - Témoignage
            targetPlatforms = platforms;
            break;
          case 3: // Jeudi - Produit
            targetPlatforms = ['linkedin', 'twitter'];
            break;
          case 4: // Vendredi - Lifestyle
            targetPlatforms = ['instagram', 'facebook'];
            break;
          case 5: // Samedi - Communauté
            targetPlatforms = ['instagram'];
            break;
          case 6: // Dimanche - Récapitulatif
            targetPlatforms = ['linkedin', 'twitter'];
            break;
        }

        weekPlan.posts.push({
          day,
          template,
          platforms: targetPlatforms,
          content: CONTENT_TEMPLATES[template]
        });
      });

      calendar.push(weekPlan);
    }

    const calendarFile = path.join(this.outputDir, 'content-calendar.json');
    fs.writeFileSync(calendarFile, JSON.stringify(calendar, null, 2));
    console.log(`📅 Calendrier de contenu créé: ${calendarFile}`);

    return calendar;
  }

  /**
   * Génère un rapport de mockups
   */
  generateReport() {
    const mockupFiles = fs.readdirSync(this.outputDir)
      .filter(file => file.endsWith('.json') && !file.includes('calendar') && !file.includes('report'))
      .map(file => {
        const filepath = path.join(this.outputDir, file);
        const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        return {
          filename: file,
          platform: content.metadata?.platform || 'unknown',
          template: content.metadata?.template || 'unknown',
          created: content.metadata?.created || 'unknown'
        };
      });

    const report = {
      generated: new Date().toISOString(),
      total: mockupFiles.length,
      byPlatform: {},
      byTemplate: {},
      recent: mockupFiles.slice(-10) // 10 plus récents
    };

    // Statistiques par plateforme
    mockupFiles.forEach(mockup => {
      report.byPlatform[mockup.platform] = (report.byPlatform[mockup.platform] || 0) + 1;
      report.byTemplate[mockup.template] = (report.byTemplate[mockup.template] || 0) + 1;
    });

    const reportFile = path.join(this.outputDir, 'mockup-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📊 Rapport généré: ${reportFile}`);

    return report;
  }
}

// Interface en ligne de commande
function main() {
  const args = process.argv.slice(2);
  const generator = new MockupGenerator();

  if (args.length === 0) {
    console.log(`
🎨 Générateur de Mockups MaxiMarket

Usage:
  node create-mockups.js <command> [options]

Commandes:
  single <platform> <template>     - Créer un mockup unique
  batch <template>                 - Créer des mockups pour toutes les plateformes
  calendar [weeks]                 - Générer un calendrier de contenu
  report                           - Générer un rapport des mockups

Exemples:
  node create-mockups.js single instagram product_showcase
  node create-mockups.js batch testimonial
  node create-mockups.js calendar 4
  node create-mockups.js report

Templates disponibles:
  - product_showcase
  - testimonial
  - business_insights
  - feature_highlight

Plateformes disponibles:
  - instagram
  - facebook
  - linkedin
  - twitter
    `);
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'single':
        if (args.length < 3) {
          throw new Error('Usage: single <platform> <template>');
        }
        const filepath = generator.generateMockup(args[1], args[2]);
        console.log(`✅ Mockup créé: ${filepath}`);
        break;

      case 'batch':
        if (args.length < 2) {
          throw new Error('Usage: batch <template>');
        }
        const results = generator.generateBatch(args[1]);
        console.log(`✅ ${results.filter(r => r.success).length} mockups créés`);
        break;

      case 'calendar':
        const weeks = args[1] ? parseInt(args[1]) : 4;
        const calendar = generator.generateContentCalendar(weeks);
        console.log(`✅ Calendrier de ${weeks} semaines créé`);
        break;

      case 'report':
        const report = generator.generateReport();
        console.log(`✅ Rapport généré avec ${report.total} mockups`);
        break;

      default:
        throw new Error(`Commande inconnue: ${command}`);
    }
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    process.exit(1);
  }
}

// Exécuter si appelé directement
main();

export default MockupGenerator;
