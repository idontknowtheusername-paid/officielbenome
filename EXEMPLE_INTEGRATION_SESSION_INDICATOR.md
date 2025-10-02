# 📱 Exemple d'Intégration - Session Indicator

## Utilisation du Composant SessionIndicator

Le composant `SessionIndicator` peut être intégré dans votre Header/Navbar pour afficher le statut de session de manière professionnelle et discrète.

---

## 🎯 Intégration dans le Header

### Option 1: Header Principal

```jsx
// src/components/Header.jsx ou src/components/Navbar.jsx

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SessionIndicator from '@/components/auth/SessionIndicator';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-primary">
              MaxiMarket
            </a>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/marketplace" className="hover:text-primary">
              Marketplace
            </a>
            <a href="/mes-annonces" className="hover:text-primary">
              Mes Annonces
            </a>
            <a href="/messages" className="hover:text-primary">
              Messages
            </a>
          </nav>

          {/* Actions Utilisateur */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* ✅ Indicateur de Session */}
                <SessionIndicator />
                
                {/* Avatar/Menu */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium hidden md:inline">
                    {user?.first_name || 'Utilisateur'}
                  </span>
                  <Button 
                    onClick={logout}
                    variant="outline"
                    size="sm"
                  >
                    Déconnexion
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <a href="/connexion">Connexion</a>
                </Button>
                <Button asChild>
                  <a href="/inscription">Inscription</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

---

### Option 2: Dashboard Admin

```jsx
// src/pages/admin/AdminLayout.jsx

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SessionIndicator from '@/components/auth/SessionIndicator';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header Admin */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Admin
              </h1>
              <p className="text-sm text-gray-500">
                Connecté en tant que {user?.email}
              </p>
            </div>

            {/* ✅ Indicateur de Session en haut à droite */}
            <SessionIndicator className="ml-auto" />
            
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
```

---

### Option 3: Page de Profil

```jsx
// src/pages/ProfilePage.jsx

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SessionIndicator from '@/components/auth/SessionIndicator';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ProfilePage = () => {
  const { user, extendSession } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      
      <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>

      {/* Carte de Sécurité */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sécurité et Session</CardTitle>
        </CardHeader>
        <CardContent>
          
          <div className="space-y-4">
            
            {/* Statut de Session */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Statut de votre session</p>
                <p className="text-sm text-muted-foreground">
                  État actuel de votre connexion
                </p>
              </div>
              
              {/* ✅ Indicateur de Session */}
              <SessionIndicator />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={extendSession}
                variant="outline"
              >
                Prolonger la session
              </Button>
              <Button 
                variant="outline"
              >
                Voir les appareils connectés
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Autres informations du profil... */}
    </div>
  );
};

export default ProfilePage;
```

---

## 🎨 Personnalisation

### Variantes de Style

```jsx
// Petit et discret
<SessionIndicator className="text-xs" />

// Avec bordure
<SessionIndicator className="border border-gray-200" />

// Sans texte (icône seulement) sur mobile
<SessionIndicator className="md:px-3 px-2" />

// Avec ombre
<SessionIndicator className="shadow-sm" />

// Arrondi complet (pill)
<SessionIndicator className="rounded-full" />
```

---

### Tooltip Personnalisé

Si vous voulez un tooltip plus détaillé avec une bibliothèque comme Radix UI:

```jsx
import SessionIndicator from '@/components/auth/SessionIndicator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <div>
        <SessionIndicator />
      </div>
    </TooltipTrigger>
    <TooltipContent>
      <div className="space-y-2">
        <p className="font-semibold">Informations de session</p>
        <p className="text-sm">Votre session est sécurisée et active.</p>
        <p className="text-xs text-muted-foreground">
          Les tokens sont renouvelés automatiquement.
        </p>
      </div>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## 📱 Responsive Design

Le composant est déjà responsive par défaut :

- **Desktop**: Affiche l'icône + texte
- **Mobile**: Affiche uniquement l'icône (via `hidden md:inline`)

Pour personnaliser :

```jsx
// Toujours afficher le texte
<SessionIndicator className="[&_span]:inline" />

// Jamais afficher le texte
<SessionIndicator className="[&_span]:hidden" />

// Afficher seulement sur desktop
<SessionIndicator className="hidden lg:flex" />
```

---

## 🔔 Avec Notifications

Pour alerter l'utilisateur quand la session va expirer :

```jsx
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import SessionIndicator from '@/components/auth/SessionIndicator';

const Header = () => {
  const { getSessionStatus, getSessionTimeLeft, extendSession } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = () => {
      const status = getSessionStatus();
      const timeLeft = getSessionTimeLeft();

      // Alerter à 5 minutes de l'expiration
      if (status === 'expiring_soon' && timeLeft < 5 * 60 * 1000) {
        toast({
          title: "Session expire bientôt",
          description: "Votre session va expirer dans quelques minutes.",
          action: (
            <Button onClick={extendSession} size="sm">
              Prolonger
            </Button>
          ),
        });
      }
    };

    // Vérifier toutes les minutes
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, [getSessionStatus, getSessionTimeLeft, toast, extendSession]);

  return (
    <header>
      {/* ... */}
      <SessionIndicator />
      {/* ... */}
    </header>
  );
};
```

---

## 🎯 Cas d'Usage Recommandés

### ✅ Où utiliser SessionIndicator :

1. **Header/Navbar principal** - Toujours visible
2. **Dashboard Admin** - Pour les sessions critiques
3. **Pages de paramètres/profil** - Section sécurité
4. **Panels de modération** - Sessions administratives
5. **Pages sensibles** - Paiements, données personnelles

### ❌ Où NE PAS utiliser :

1. **Pages publiques** - Pas de session à afficher
2. **Landing pages** - Marketing, pas d'authentification
3. **Footer** - Redondant avec le header
4. **Pop-ups/Modales** - Peut être intrusif

---

## 🔧 Extension du Composant

Pour ajouter des fonctionnalités :

```jsx
// SessionIndicator avec bouton d'action
import SessionIndicator from '@/components/auth/SessionIndicator';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const SessionIndicatorWithAction = () => {
  const { extendSession } = useAuth();

  return (
    <div className="flex items-center gap-2">
      <SessionIndicator />
      <Button 
        onClick={extendSession}
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
        title="Prolonger la session"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};
```

---

## 📊 Analytics (Optionnel)

Tracker les événements de session :

```jsx
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SessionIndicator from '@/components/auth/SessionIndicator';

const Header = () => {
  const { getSessionStatus } = useAuth();

  useEffect(() => {
    const status = getSessionStatus();
    
    // Tracker avec votre solution analytics
    if (window.gtag) {
      window.gtag('event', 'session_status', {
        status: status,
        timestamp: new Date().toISOString()
      });
    }
  }, [getSessionStatus]);

  return (
    <header>
      <SessionIndicator />
    </header>
  );
};
```

---

## ✅ Checklist d'Intégration

- [ ] Importer le composant dans votre Header
- [ ] Vérifier qu'il s'affiche uniquement si `isAuthenticated`
- [ ] Tester sur mobile et desktop
- [ ] Vérifier les différents états (active, expiring, remembered)
- [ ] Optionnel : Ajouter des tooltips détaillés
- [ ] Optionnel : Configurer les notifications d'expiration
- [ ] Optionnel : Tracker les événements analytics

---

## 🎉 Résultat Attendu

Après intégration, vos utilisateurs verront :

- 🟢 **Session persistante** : Quand "Remember Me" est activé
- 🔵 **Session active** : Connexion standard avec temps restant
- 🟠 **Session expire bientôt** : Alerte avant expiration
- 🔴 **Session expirée** : Indication de reconnexion nécessaire

---

*Composant créé le 2 Octobre 2025*  
*Compatible avec tous les navigateurs modernes*
