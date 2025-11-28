# Configuration Vercel - MaxiMarket

## 🌐 Redirection WWW → Non-WWW

### Dans le Dashboard Vercel :

1. Va sur : https://vercel.com/dashboard
2. Sélectionne ton projet **MaxiMarket**
3. Va dans **Settings** → **Domains**
4. Configure les domaines :

#### Domaine principal (sans www) :
```
maxiimarket.com → Production
```

#### Redirection www :
```
www.maxiimarket.com → Redirect to maxiimarket.com (308 Permanent)
```

### Étapes détaillées :

1. **Ajouter le domaine sans www** :
   - Clique sur "Add Domain"
   - Entre : `maxiimarket.com`
   - Clique sur "Add"

2. **Ajouter le domaine avec www** :
   - Clique sur "Add Domain"
   - Entre : `www.maxiimarket.com`
   - Sélectionne "Redirect to maxiimarket.com"
   - Clique sur "Add"

3. **Vérifier la configuration DNS** :
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel IP)
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## 🔄 Redirections configurées

### Dans vercel.json :

✅ `/marketplace/automobile` → `/automobile` (301)
✅ `/marketplace/immobilier` → `/immobilier` (301)
✅ `/marketplace/services` → `/services` (301)
✅ `/marketplace/*` → `/*` (301)
✅ `/about` → `/a-propos` (301)
✅ `/terms` → `/conditions-utilisation` (301)
✅ `/privacy` → `/politique-confidentialite` (301)

---

## 📝 Après déploiement

### 1. Tester les redirections :

```bash
# Tester la redirection www
curl -I https://www.maxiimarket.com

# Devrait retourner :
# HTTP/2 308
# location: https://maxiimarket.com

# Tester les anciennes URLs
curl -I https://maxiimarket.com/marketplace/automobile
# Devrait rediriger vers /automobile

curl -I https://maxiimarket.com/about
# Devrait rediriger vers /a-propos
```

### 2. Dans Google Search Console :

1. **Valider les redirections** :
   - Inspection de l'URL
   - Teste chaque ancienne URL
   - Vérifie qu'elle redirige correctement

2. **Marquer comme corrigé** :
   - Va dans "Soft 404"
   - Clique sur "Validate Fix"
   - Google va ré-explorer les pages

3. **Soumettre à nouveau le sitemap** :
   - Sitemaps → Soumettre à nouveau
   - Attends 2-3 jours

---

## 🚀 Déploiement

### Commandes :

```bash
# Commit les changements
git add vercel.json
git commit -m "fix: Add redirects for old URLs and www redirect"
git push

# Vercel va automatiquement déployer
```

### Vérifier le déploiement :
1. Va sur Vercel Dashboard
2. Vérifie que le build est réussi
3. Teste les redirections

---

## ✅ Checklist

- [x] Redirections ajoutées dans vercel.json
- [ ] Déployer sur Vercel
- [ ] Configurer www → non-www dans Vercel Dashboard
- [ ] Tester toutes les redirections
- [ ] Valider les corrections dans Google Search Console
- [ ] Attendre la ré-exploration (2-7 jours)

---

## 📊 Résultat attendu

Après corrections et ré-exploration :
- ✅ 0 Soft 404
- ✅ Toutes les anciennes URLs redirigent correctement
- ✅ www.maxiimarket.com → maxiimarket.com
- ✅ Pages indexées : 9+
