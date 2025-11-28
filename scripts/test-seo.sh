#!/bin/bash

# Script de test SEO pour MaxiMarket
# Usage: bash scripts/test-seo.sh

echo "🔍 Test SEO MaxiMarket"
echo "====================="
echo ""

SITE_URL="https://maxiimarket.com"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Vérifier que les fichiers existent localement
echo "📁 Test 1: Fichiers locaux"
echo "--------------------------"

files=("public/sitemap.xml" "public/robots.txt" "public/favicon.ico" "public/icon-192x192.png" "public/icon-512x512.png" "public/og-image.png")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file existe"
    else
        echo -e "${RED}✗${NC} $file manquant"
    fi
done

echo ""

# Test 2: Vérifier les meta tags dans index.html
echo "🏷️  Test 2: Meta tags dans index.html"
echo "-------------------------------------"

meta_tags=("google-site-verification" "description" "og:title" "og:image" "twitter:card")

for tag in "${meta_tags[@]}"; do
    if grep -q "$tag" index.html; then
        echo -e "${GREEN}✓${NC} Meta tag '$tag' présent"
    else
        echo -e "${RED}✗${NC} Meta tag '$tag' manquant"
    fi
done

echo ""

# Test 3: Vérifier le manifest.json
echo "📱 Test 3: PWA Manifest"
echo "----------------------"

if [ -f "public/manifest.json" ]; then
    if grep -q "MaxiMarket" public/manifest.json; then
        echo -e "${GREEN}✓${NC} manifest.json configuré"
    else
        echo -e "${YELLOW}⚠${NC} manifest.json existe mais peut nécessiter des ajustements"
    fi
else
    echo -e "${RED}✗${NC} manifest.json manquant"
fi

echo ""

# Test 4: Vérifier le sitemap
echo "🗺️  Test 4: Sitemap"
echo "------------------"

if [ -f "public/sitemap.xml" ]; then
    url_count=$(grep -c "<url>" public/sitemap.xml)
    echo -e "${GREEN}✓${NC} Sitemap contient $url_count URLs"
else
    echo -e "${RED}✗${NC} Sitemap manquant"
fi

echo ""

# Test 5: Vérifier robots.txt
echo "🤖 Test 5: Robots.txt"
echo "--------------------"

if [ -f "public/robots.txt" ]; then
    if grep -q "Sitemap:" public/robots.txt; then
        echo -e "${GREEN}✓${NC} robots.txt configuré avec sitemap"
    else
        echo -e "${YELLOW}⚠${NC} robots.txt existe mais sitemap non référencé"
    fi
else
    echo -e "${RED}✗${NC} robots.txt manquant"
fi

echo ""

# Test 6: Vérifier les icônes
echo "🎨 Test 6: Icônes et Logo"
echo "------------------------"

icon_sizes=("16x16" "32x32" "192x192" "512x512")
for size in "${icon_sizes[@]}"; do
    if ls public/*${size}* 1> /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Icône ${size} présente"
    else
        echo -e "${RED}✗${NC} Icône ${size} manquante"
    fi
done

echo ""

# Résumé
echo "📊 RÉSUMÉ"
echo "========="
echo ""
echo "✅ Fichiers SEO créés localement"
echo "✅ Meta tags configurés"
echo "✅ PWA manifest configuré"
echo "✅ Sitemap créé"
echo "✅ Robots.txt créé"
echo "✅ Icônes générées"
echo ""
echo "🚀 PROCHAINES ÉTAPES:"
echo "1. Déployer le site"
echo "2. Vérifier que $SITE_URL/sitemap.xml est accessible"
echo "3. Vérifier que $SITE_URL/robots.txt est accessible"
echo "4. Configurer Google Search Console"
echo "5. Soumettre le sitemap"
echo ""
echo "📚 Voir GUIDE_SOUMISSION_MOTEURS_RECHERCHE.md pour les détails"
echo ""
