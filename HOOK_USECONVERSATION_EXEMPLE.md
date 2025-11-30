# 🎯 Hook Expert : `useConversation`

## 📋 Vue d'ensemble

Le hook `useConversation` est un **hook composé de niveau expert** qui regroupe toutes les fonctionnalités nécessaires pour gérer une conversation complète.

## ✨ Avantages

### Avant (Code verbeux)
```javascript
// ❌ Beaucoup de code répétitif dans chaque composant
const ConversationView = ({ conversationId }) => {
  const { data, isLoading, hasNextPage, fetchNextPage } = useConversationMessages(conversationId);
  const { mutate: markAsRead } = useMarkMessagesAsRead();
  
  // Activer le realtime
  useRealtimeMessages(conversationId);
  
  // Aplatir les messages
  const messages = data?.pages.flat() || [];
  
  // Marquer comme lu
  const handleMarkAsRead = () => {
    markAsRead(conversationId);
  };
  
  // ... reste du code
};
```

### Après (Code propre)
```javascript
// ✅ Une seule ligne, tout est géré
const ConversationView = ({ conversationId }) => {
  const {
    messages,
    isLoading,
    hasNextPage,
    fetchNextPage,
    markAsRead
  } = useConversation(conversationId);
  
  // ... reste du code
};
```

## 🚀 Utilisation

### Exemple complet

```javascript
import { useConversation } from '@/hooks';

const ConversationView = ({ conversationId }) => {
  const {
    // Données
    messages,
    error,
    
    // États de chargement
    isLoading,
    isFetchingNextPage,
    isMarkingAsRead,
    
    // Pagination
    hasNextPage,
    fetchNextPage,
    
    // Actions
    markAsRead,
  } = useConversation(conversationId);

  // Marquer comme lu à l'ouverture
  useEffect(() => {
    markAsRead();
  }, [conversationId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div>
      {/* Liste des messages */}
      <MessageList messages={messages} />
      
      {/* Bouton charger plus */}
      {hasNextPage && (
        <Button 
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Chargement...' : 'Charger plus'}
        </Button>
      )}
      
      {/* Input de message */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
};
```

## 📊 Ce que le hook gère automatiquement

| Fonctionnalité | Description |
|----------------|-------------|
| ✅ Messages | Récupération avec pagination infinie |
| ✅ Realtime | Synchronisation automatique des nouveaux messages |
| ✅ Marquage lu | Fonction helper pour marquer comme lu |
| ✅ Aplatissement | Messages déjà aplatis (pas besoin de `.flat()`) |
| ✅ États | Tous les états de chargement disponibles |
| ✅ Erreurs | Gestion centralisée des erreurs |

## 🎨 API Complète

### Retour du hook

```typescript
{
  // Données
  messages: Message[],           // Messages aplatis et triés
  error: Error | null,           // Erreur éventuelle
  
  // États de chargement
  isLoading: boolean,            // Chargement initial
  isFetchingNextPage: boolean,   // Chargement page suivante
  isMarkingAsRead: boolean,      // Marquage en cours
  
  // Pagination
  hasNextPage: boolean,          // Y a-t-il une page suivante ?
  fetchNextPage: () => void,     // Charger la page suivante
  
  // Actions
  markAsRead: () => void,        // Marquer tous les messages comme lus
}
```

## 💡 Cas d'usage avancés

### 1. Scroll infini

```javascript
const ConversationView = ({ conversationId }) => {
  const { messages, hasNextPage, fetchNextPage } = useConversation(conversationId);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop < 100 && hasNextPage) {
        fetchNextPage();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, fetchNextPage]);

  return (
    <div ref={containerRef} className="overflow-y-auto">
      {messages.map(msg => <Message key={msg.id} message={msg} />)}
    </div>
  );
};
```

### 2. Marquage automatique comme lu

```javascript
const ConversationView = ({ conversationId }) => {
  const { messages, markAsRead } = useConversation(conversationId);

  // Marquer comme lu après 2 secondes de visibilité
  useEffect(() => {
    const timer = setTimeout(() => {
      markAsRead();
    }, 2000);

    return () => clearTimeout(timer);
  }, [conversationId, markAsRead]);

  return <MessageList messages={messages} />;
};
```

### 3. Indicateur de nouveaux messages

```javascript
const ConversationView = ({ conversationId }) => {
  const { messages } = useConversation(conversationId);
  const [lastSeenCount, setLastSeenCount] = useState(messages.length);

  const newMessagesCount = messages.length - lastSeenCount;

  const handleScrollToBottom = () => {
    setLastSeenCount(messages.length);
    // Scroll vers le bas
  };

  return (
    <div>
      {newMessagesCount > 0 && (
        <Button onClick={handleScrollToBottom}>
          {newMessagesCount} nouveau(x) message(s)
        </Button>
      )}
      <MessageList messages={messages} />
    </div>
  );
};
```

## 🔧 Personnalisation

Si tu as besoin de plus de contrôle, tu peux toujours utiliser les hooks individuels :

```javascript
// Pour un contrôle total
const { data, isLoading } = useConversationMessages(conversationId);
const { mutate: markAsRead } = useMarkMessagesAsRead();
useRealtimeMessages(conversationId);

// Traitement personnalisé
const messages = data?.pages.flat().filter(msg => !msg.deleted) || [];
```

## 📈 Performance

Le hook `useConversation` est optimisé pour :
- ✅ Pas de re-renders inutiles
- ✅ Cache partagé entre tous les composants
- ✅ Realtime activé une seule fois par conversation
- ✅ Pagination efficace

## 🎯 Bonnes pratiques

### ✅ À faire

```javascript
// Utiliser au niveau du composant de conversation
const ConversationView = ({ conversationId }) => {
  const conversation = useConversation(conversationId);
  // ...
};
```

### ❌ À éviter

```javascript
// Ne PAS utiliser dans une liste de conversations
const ConversationList = ({ conversations }) => {
  return conversations.map(conv => {
    // ❌ Mauvais : trop de subscriptions realtime
    const { messages } = useConversation(conv.id);
    return <ConversationItem messages={messages} />;
  });
};

// ✅ Bon : utiliser useGlobalRealtimeMessages à la place
const ConversationList = ({ conversations }) => {
  useGlobalRealtimeMessages(); // Une seule subscription globale
  return conversations.map(conv => (
    <ConversationItem key={conv.id} conversation={conv} />
  ));
};
```

## 🚀 Migration

### Avant

```javascript
const ConversationView = ({ conversationId }) => {
  const { data, isLoading, hasNextPage, fetchNextPage } = useConversationMessages(conversationId);
  const { mutate: markAsRead, isPending } = useMarkMessagesAsRead();
  useRealtimeMessages(conversationId);
  
  const messages = data?.pages.flat() || [];
  
  const handleMarkAsRead = () => {
    markAsRead(conversationId);
  };
  
  // 15 lignes de code...
};
```

### Après

```javascript
const ConversationView = ({ conversationId }) => {
  const {
    messages,
    isLoading,
    hasNextPage,
    fetchNextPage,
    markAsRead,
    isMarkingAsRead
  } = useConversation(conversationId);
  
  // 7 lignes de code - 50% de réduction !
};
```

## 📝 Conclusion

Le hook `useConversation` est la **meilleure façon** de gérer une conversation dans ton application. Il :

- ✅ Réduit le code de 50%
- ✅ Améliore la lisibilité
- ✅ Centralise la logique
- ✅ Facilite la maintenance
- ✅ Évite les erreurs

**Utilise-le partout où tu affiches une conversation !** 🎉

---

**Créé le** : 30 novembre 2025  
**Niveau** : Expert  
**Statut** : ✅ Production Ready
