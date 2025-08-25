# 🔧 Correction des Clés KkiaPay

## ❌ Problème actuel :
- **VITE_KKIAPAY_SECRET_KEY** = `tpk_0cf13552819511f09ce691e5b43c1d2c` (INCORRECT)
- **VITE_KKIAPAY_PUBLIC_KEY** = `0cf13550819511f09ce691e5b43c1d2c` (CORRECT)

## ✅ Correction à faire dans Vercel :

### Dans Vercel Dashboard :
1. **Allez dans** votre projet
2. **Settings** → **Environment Variables**
3. **Modifiez** `VITE_KKIAPAY_SECRET_KEY` :
   - **Ancienne valeur** : `tpk_0cf13552819511f09ce691e5b43c1d2c`
   - **Nouvelle valeur** : `tsk_0cf15c60819511f09ce691e5b43c1d2c`

### Clés KkiaPay Sandbox correctes :
- **Public API Key** : `0cf13550819511f09ce691e5b43c1d2c` ✅
- **Private API Key** : `tpk_0cf13552819511f09ce691e5b43c1d2c` (pour API)
- **Secret** : `tsk_0cf15c60819511f09ce691e5b43c1d2c` ✅ (pour webhook)

## 🎯 Pour le widget KkiaPay :
- **Utilisez** : `VITE_KKIAPAY_PUBLIC_KEY` (déjà correct)
- **Le widget** n'a pas besoin du secret key

## 🔄 Après modification :
1. **Sauvegardez** les variables
2. **Redéployez** le projet
3. **Testez** : https://maxiimarket.com/kkiapay-test
