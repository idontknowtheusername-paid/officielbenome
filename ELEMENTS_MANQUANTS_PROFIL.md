# 📋 Éléments Manquants dans le Profil Utilisateur

## ✅ Ce qui existe déjà

### Sections Actuelles (5 tabs)
1. ✅ **Dashboard** - Statistiques et actions rapides
2. ✅ **Mes Annonces** - Gestion des annonces
3. ✅ **Favoris** - Annonces sauvegardées
4. ✅ **Profil** - Informations personnelles
5. ✅ **Sécurité** - Changement de mot de passe

### Fonctionnalités Présentes
- ✅ Photo de profil (avatar)
- ✅ Nom, prénom, email, téléphone
- ✅ Badge "Compte vérifié"
- ✅ Date d'inscription
- ✅ Statistiques (annonces, vues, contacts, messages)
- ✅ Actions rapides (6 boutons)
- ✅ Gestion des annonces (éditer, supprimer, rafraîchir, booster)
- ✅ Changement de mot de passe

---

## ❌ Ce qui manque ESSENTIELLEMENT

### 1. 📸 **Upload de Photo de Profil**
**Priorité: HAUTE** 🔴

**Actuellement:**
- Avatar par défaut (initiales ou icône)
- Pas de possibilité de changer la photo

**À ajouter:**
```jsx
// Bouton pour changer la photo
<Button 
  variant="outline" 
  size="sm"
  className="absolute bottom-0 right-0"
  onClick={handleUploadPhoto}
>
  <Camera className="h-4 w-4" />
</Button>

// Service d'upload
uploadProfilePhoto: async (file) => {
  // Upload vers Supabase Storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${user.id}/${file.name}`, file);
    
  // Mettre à jour l'URL dans users table
  await supabase
    .from('users')
    .update({ profile_image: publicUrl })
    .eq('id', user.id);
}
```

---

### 2. 📍 **Adresse / Localisation**
**Priorité: HAUTE** 🔴

**Manque:**
- Ville
- Pays
- Adresse complète (optionnelle)

**À ajouter dans le formulaire Profil:**
```jsx
<div className="space-y-2">
  <Label htmlFor="city">Ville</Label>
  <Input
    id="city"
    {...register('city')}
  />
</div>

<div className="space-y-2">
  <Label htmlFor="country">Pays</Label>
  <Select {...register('country')}>
    <SelectItem value="BJ">Bénin</SelectItem>
    <SelectItem value="TG">Togo</SelectItem>
    <SelectItem value="CI">Côte d'Ivoire</SelectItem>
    {/* ... */}
  </Select>
</div>
```

---

### 3. 📝 **Bio / Description**
**Priorité: MOYENNE** 🟡

**Manque:**
- Biographie de l'utilisateur
- Description personnelle
- À propos de moi

**À ajouter:**
```jsx
<div className="space-y-2">
  <Label htmlFor="bio">À propos de moi</Label>
  <Textarea
    id="bio"
    rows={4}
    maxLength={500}
    placeholder="Parlez-nous de vous..."
    {...register('bio')}
  />
  <p className="text-xs text-muted-foreground">
    {watch('bio')?.length || 0}/500 caractères
  </p>
</div>
```

---

### 4. 🔔 **Préférences de Notifications**
**Priorité: HAUTE** 🔴

**Manque:**
- Notifications par email
- Notifications push
- Notifications SMS
- Préférences de communication

**À ajouter (nouvelle section ou dans Sécurité):**
```jsx
<Card>
  <CardHeader>
    <CardTitle>Notifications</CardTitle>
    <CardDescription>
      Gérez vos préférences de notifications
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <Label>Notifications par email</Label>
        <p className="text-sm text-muted-foreground">
          Recevoir des emails pour les nouveaux messages
        </p>
      </div>
      <Switch
        checked={emailNotifications}
        onCheckedChange={setEmailNotifications}
      />
    </div>
    
    <div className="flex items-center justify-between">
      <div>
        <Label>Notifications push</Label>
        <p className="text-sm text-muted-foreground">
          Recevoir des notifications sur votre appareil
        </p>
      </div>
      <Switch
        checked={pushNotifications}
        onCheckedChange={setPushNotifications}
      />
    </div>
    
    <div className="flex items-center justify-between">
      <div>
        <Label>Newsletter</Label>
        <p className="text-sm text-muted-foreground">
          Recevoir les actualités et offres spéciales
        </p>
      </div>
      <Switch
        checked={newsletter}
        onCheckedChange={setNewsletter}
      />
    </div>
  </CardContent>
</Card>
```

---

### 5. 🌐 **Langue et Région**
**Priorité: MOYENNE** 🟡

**Manque:**
- Préférence de langue
- Fuseau horaire
- Format de date
- Devise préférée

**À ajouter:**
```jsx
<div className="space-y-2">
  <Label htmlFor="language">Langue</Label>
  <Select {...register('language')}>
    <SelectItem value="fr">Français</SelectItem>
    <SelectItem value="en">English</SelectItem>
  </Select>
</div>

<div className="space-y-2">
  <Label htmlFor="currency">Devise</Label>
  <Select {...register('currency')}>
    <SelectItem value="XOF">FCFA (XOF)</SelectItem>
    <SelectItem value="EUR">Euro (EUR)</SelectItem>
    <SelectItem value="USD">Dollar (USD)</SelectItem>
  </Select>
</div>
```

---

### 6. 🔗 **Réseaux Sociaux**
**Priorité: BASSE** 🟢

**Manque:**
- Liens vers réseaux sociaux
- WhatsApp Business
- Facebook
- Instagram
- TikTok
- LinkedIn

**À ajouter:**
```jsx
<div className="space-y-4">
  <h3 className="font-semibold">Réseaux sociaux</h3>
  
  <div className="space-y-2">
    <Label htmlFor="whatsapp">WhatsApp</Label>
    <Input
      id="whatsapp"
      type="tel"
      placeholder="+229 XX XX XX XX"
      {...register('whatsapp')}
    />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="facebook">Facebook</Label>
    <Input
      id="facebook"
      placeholder="https://facebook.com/..."
      {...register('facebook')}
    />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="instagram">Instagram</Label>
    <Input
      id="instagram"
      placeholder="https://instagram.com/..."
      {...register('instagram')}
    />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="tiktok">TikTok</Label>
    <Input
      id="tiktok"
      placeholder="https://tiktok.com/@..."
      {...register('tiktok')}
    />
  </div>
</div>
```

---

### 7. 🗑️ **Suppression de Compte**
**Priorité: HAUTE** 🔴

**Manque:**
- Option pour supprimer le compte
- Confirmation de suppression
- Export des données avant suppression

**À ajouter dans Sécurité:**
```jsx
<Card className="border-destructive">
  <CardHeader>
    <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
    <CardDescription>
      Actions irréversibles sur votre compte
    </CardDescription>
  </CardHeader>
  <CardContent>
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer mon compte
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Toutes vos données seront supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteAccount}>
            Supprimer définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </CardContent>
</Card>
```

---

### 8. 📊 **Historique d'Activité**
**Priorité: BASSE** 🟢

**Manque:**
- Historique des connexions
- Appareils connectés
- Activités récentes

---

### 9. ✅ **Vérification du Compte**
**Priorité: MOYENNE** 🟡

**Manque:**
- Vérification email (si pas fait)
- Vérification téléphone (SMS)
- Vérification identité (KYC pour vendeurs pro)

**À ajouter:**
```jsx
<Card>
  <CardHeader>
    <CardTitle>Vérifications</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        <span>Email vérifié</span>
      </div>
      {user.emailVerified ? (
        <Badge variant="default">
          <CheckCircle className="h-3 w-3 mr-1" />
          Vérifié
        </Badge>
      ) : (
        <Button size="sm" variant="outline">
          Vérifier
        </Button>
      )}
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4" />
        <span>Téléphone vérifié</span>
      </div>
      {user.phoneVerified ? (
        <Badge variant="default">
          <CheckCircle className="h-3 w-3 mr-1" />
          Vérifié
        </Badge>
      ) : (
        <Button size="sm" variant="outline">
          Vérifier
        </Button>
      )}
    </div>
  </CardContent>
</Card>
```

---

## 🎯 Priorités d'Implémentation

### Phase 1 - CRITIQUE (À faire maintenant)
1. 🔴 **Upload photo de profil**
2. 🔴 **Adresse/Localisation** (ville, pays)
3. 🔴 **Préférences notifications**
4. 🔴 **Suppression de compte**

### Phase 2 - IMPORTANT (Prochainement)
5. 🟡 **Bio/Description**
6. 🟡 **Langue et région**
7. 🟡 **Vérification compte**

### Phase 3 - BONUS (Plus tard)
8. 🟢 **Réseaux sociaux**
9. 🟢 **Historique d'activité**

---

## 📦 Tables Supabase à Mettre à Jour

```sql
-- Ajouter les colonnes manquantes dans users
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'fr';
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'XOF';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS newsletter BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tiktok TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
```

---

## 🚀 Recommandation

**Commence par la Phase 1** qui contient les éléments essentiels pour un profil utilisateur complet et fonctionnel. Les autres phases peuvent être ajoutées progressivement selon les besoins.
