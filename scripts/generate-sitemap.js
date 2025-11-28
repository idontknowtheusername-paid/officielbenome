#!/usr/bin/env node

/**
 * Script de génération automatique du sitemap pour MaxiMarket
 * 
 * Usage:
 *   node scripts/generate-sitemap.js
 * 
 * Ce script génère :
 * - sitemap-listings.xml (toutes les annonces actives)
 * - sitemap-images.xml (toutes les images des annonces)
 * - Met à jour les dates dans sitemap-index.xml
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const SITE_URL = 'https://maxiimarket.com';
const MAX_URLS_PER_FILE = 50000;

// Fonction pour échapper les caractères XML
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Fonction pour formater la date ISO
function formatDate(date) {
  return new Date(date).toISOString();
}

// Générer sitemap-listings.xml
async function generateListingsSitemap() {
  console.log('📝 Génération du sitemap des annonces...');
  
  try {
    // Récupérer toutes les annonces actives et approuvées
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, title, description, images, updated_at, category, location')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(MAX_URLS_PER_FILE);

    if (error) throw error;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
`;

    listings.forEach(listing => {
      const url = `${SITE_URL}/annonce/${listing.id}`;
      const lastmod = formatDate(listing.updated_at);
      const title = escapeXml(listing.title);
      const description = escapeXml(listing.description);

      xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <mobile:mobile/>
`;

      // Ajouter les images
      if (listing.images && Array.isArray(listing.images)) {
        listing.images.slice(0, 5).forEach((image, index) => {
          xml += `    <image:image>
      <image:loc>${escapeXml(image)}</image:loc>
      <image:title>${title}</image:title>
      <image:caption>${description.substring(0, 200)}</image:caption>
    </image:image>
`;
        });
      }

      xml += `  </url>
`;
    });

    xml += `</urlset>`;

    // Écrire le fichier
    const outputPath = path.join(__dirname, '../public/sitemap-listings.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');
    
    console.log(`✅ Sitemap des annonces généré : ${listings.length} annonces`);
    return listings.length;
  } catch (error) {
    console.error('❌ Erreur lors de la génération du sitemap des annonces:', error);
    return 0;
  }
}

// Générer sitemap-images.xml
async function generateImagesSitemap() {
  console.log('🖼️  Génération du sitemap des images...');
  
  try {
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, title, images, location')
      .eq('status', 'approved')
      .not('images', 'is', null)
      .limit(MAX_URLS_PER_FILE);

    if (error) throw error;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Logo et images principales -->
  <url>
    <loc>${SITE_URL}/</loc>
    <image:image>
      <image:loc>${SITE_URL}/logo.png</image:loc>
      <image:title>MaxiMarket - Marketplace Afrique de l'Ouest</image:title>
      <image:caption>Logo officiel de MaxiMarket</image:caption>
    </image:image>
    <image:image>
      <image:loc>${SITE_URL}/og-image.png</image:loc>
      <image:title>MaxiMarket - Plateforme de petites annonces</image:title>
    </image:image>
  </url>
`;

    let imageCount = 2; // Logo + OG image

    listings.forEach(listing => {
      if (!listing.images || !Array.isArray(listing.images)) return;

      const url = `${SITE_URL}/annonce/${listing.id}`;
      const title = escapeXml(listing.title);
      const location = listing.location ? 
        `${listing.location.city || ''}, ${listing.location.country || ''}` : '';

      xml += `  <url>
    <loc>${url}</loc>
`;

      listing.images.slice(0, 10).forEach(image => {
        xml += `    <image:image>
      <image:loc>${escapeXml(image)}</image:loc>
      <image:title>${title}</image:title>
      ${location ? `<image:geo_location>${escapeXml(location)}</image:geo_location>` : ''}
      <image:license>${SITE_URL}/conditions-utilisation</image:license>
    </image:image>
`;
        imageCount++;
      });

      xml += `  </url>
`;
    });

    xml += `</urlset>`;

    const outputPath = path.join(__dirname, '../public/sitemap-images.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');
    
    console.log(`✅ Sitemap des images généré : ${imageCount} images`);
    return imageCount;
  } catch (error) {
    console.error('❌ Erreur lors de la génération du sitemap des images:', error);
    return 0;
  }
}

// Mettre à jour sitemap-index.xml avec les nouvelles dates
function updateSitemapIndex() {
  console.log('📋 Mise à jour du sitemap index...');
  
  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
  <sitemap>
    <loc>${SITE_URL}/sitemap-main.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  
  <sitemap>
    <loc>${SITE_URL}/sitemap-listings.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  
  <sitemap>
    <loc>${SITE_URL}/sitemap-categories.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  
  <sitemap>
    <loc>${SITE_URL}/sitemap-images.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  
  <sitemap>
    <loc>${SITE_URL}/sitemap-blog.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>

</sitemapindex>`;

  const outputPath = path.join(__dirname, '../public/sitemap-index.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  
  console.log('✅ Sitemap index mis à jour');
}

// Fonction principale
async function main() {
  console.log('🚀 Génération des sitemaps MaxiMarket...\n');
  
  const listingsCount = await generateListingsSitemap();
  const imagesCount = await generateImagesSitemap();
  updateSitemapIndex();
  
  console.log('\n✨ Génération terminée !');
  console.log(`📊 Statistiques :`);
  console.log(`   - Annonces : ${listingsCount}`);
  console.log(`   - Images : ${imagesCount}`);
  console.log(`\n💡 N'oublie pas de soumettre le sitemap à Google Search Console !`);
  console.log(`   URL : ${SITE_URL}/sitemap-index.xml`);
}

// Exécuter
main().catch(console.error);
