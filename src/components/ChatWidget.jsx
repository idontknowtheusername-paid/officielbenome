import React, { useEffect, useMemo, useRef, useState } from 'react';
import { chatWithMistral, chatWithMistralStream } from '@/lib/mistralClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolveSearchIntent } from '@/lib/search-intent';
import { listingService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { TypingIndicator, ProgressBar } from '@/components/ui/loading';
import AdvancedThinkingIndicator from '@/components/ui/loading/AdvancedThinkingIndicator';
import MessageBubble from '@/components/ui/MessageBubble';
import SuggestionChips from '@/components/ui/SuggestionChips';
import { aidaIntelligenceService } from '@/services/aidaIntelligence.service';

const ChatWidget = ({ pageContext = {} }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(''); // 'thinking', 'searching', 'processing'
  const [history, setHistory] = useState([]); // {role, content}
  const [conversations, setConversations] = useState([]); // [{id, title, messages, date}]
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [hasSuggestions, setHasSuggestions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [advancedThinking, setAdvancedThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [currentThinkingStep, setCurrentThinkingStep] = useState(0);
  const [userContext, setUserContext] = useState(null);
  const [intelligentSuggestions, setIntelligentSuggestions] = useState([]);
  const listRef = useRef(null);
  const abortRef = useRef(null);

  const context = useMemo(() => ({
    path: window.location.pathname,
          ...(typeof window !== 'undefined' && window.__MAXIMARKET_CONTEXT ? window.__MAXIMARKET_CONTEXT : {}),
    ...pageContext,
  }), [pageContext]);

  // Charger les conversations depuis localStorage
  useEffect(() => {
    const savedConversations = localStorage.getItem('chatbot_conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        if (Array.isArray(parsed)) {
          setConversations(parsed);
        }
      } catch (e) {
        console.error('Erreur parsing conversations:', e);
      }
    }
  }, []);

  // Sauvegarder les conversations dans localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('chatbot_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Detecter mobile et gerer le resize
  useEffect(() => {
    const update = () => setIsMobile(window.matchMedia('(max-width: 640px)').matches);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Initialiser l'analyse contextuelle AIDA
  useEffect(() => {
    const initializeAIDAContext = async () => {
      try {
        // Récupérer l'historique de recherche depuis localStorage
        const searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
        
        // Analyser le contexte utilisateur
        const context = await aidaIntelligenceService.analyzeUserContext(
          user?.id,
          window.location.pathname,
          searchHistory
        );
        
        setUserContext(context);
        
        // Générer des suggestions intelligentes
        if (context) {
          const recommendations = await aidaIntelligenceService.generateRecommendations(context, '');
          setIntelligentSuggestions(recommendations);
        }
      } catch (error) {
        console.error('Erreur initialisation contexte AIDA:', error);
      }
    };

    if (open) {
      initializeAIDAContext();
    }
  }, [open, user?.id]);

  // Fonction pour traiter un message (extrait de send pour réutilisation)
  const processMessage = async (msg, newHistory) => {
    try {
      // Démarrer le thinking avancé pour les requêtes complexes
      const isComplexQuery = msg.length > 20 || /\b(prix|marché|tendance|recommandation|suggestion|analyse|comparaison)\b/i.test(msg);
      
      if (isComplexQuery && userContext) {
        setAdvancedThinking(true);
        const steps = aidaIntelligenceService.getAdvancedThinkingSteps(userContext, msg);
        setThinkingSteps(steps);
        setCurrentThinkingStep(0);
        
        // Simuler les étapes de thinking
        for (let i = 0; i < steps.length; i++) {
          setCurrentThinkingStep(i);
          await new Promise(resolve => setTimeout(resolve, steps[i].duration));
        }
        
        // Générer des recommandations intelligentes
        const recommendations = await aidaIntelligenceService.generateRecommendations(userContext, msg);
        setIntelligentSuggestions(recommendations);
      }

      // Verifier si c'est vraiment une recherche (pas juste un salut)
      const isGreeting = /^(yo|salut|bonjour|hello|hi|hey|ciao|hola|bonsoir|bonne\s+nuit)$/i.test(msg.trim());
      const hasSearchKeywords = /\b(appartement|maison|voiture|service|immobilier|auto|plombier|electricien|terrain|studio|villa|moto|scooter|camion|menage|jardinage|coiffure|reparation|demenagement|cours|prof|informatique|evenementiel)\b/i.test(msg.toLowerCase());
      const hasPriceOrLocation = /\d+\s*(k|m|xof|frs?)|(dakar|abidjan|lome|cotonou|thiès|saint-louis|kaolack|ziguinchor|touba|mbour|rufisque|pikine|guediawaye)/i.test(msg.toLowerCase());

      // Detection d'intention de recherche simple (seulement si ce n'est pas un salut)
      let intent = null;
      let prefixedContent = '';
      let suggestions = [];
      setHasSuggestions(false);
      
      if (!isGreeting && (hasSearchKeywords || hasPriceOrLocation)) {
        intent = resolveSearchIntent(msg);
      }
      
      if (intent) {
        setLoadingStage('searching');
        const { section, params } = intent;
        const categoryMap = {
          immobilier: 'real_estate',
          automobile: 'automobile',
          services: 'services',
          marketplace: 'marketplace'
        };
        const filters = {
          ...params,
          category: categoryMap[section] || undefined,
          limit: 3,
          page: 0,
          status: 'approved'
        };
        try {
          const result = await listingService.getAllListings(filters);
          if (result?.data?.length) {
            suggestions = result.data.slice(0, 3).map(l => ({ id: l.id, title: l.title, price: l.price }));
            prefixedContent += `J'ai trouvé ${result.data.length} résultats. Voici quelques suggestions:\n` + suggestions.map(s => `• ${s.title} — ${s.price ?? ''} XOF (ouvrir: /annonce/${s.id})`).join('\n') + '\n\n';
            setHasSuggestions(true);
          }
        } catch {}
      }

      // Terminer le thinking avancé si actif
      if (advancedThinking) {
        setAdvancedThinking(false);
        setThinkingSteps([]);
        setCurrentThinkingStep(0);
      }

      // Streaming: on ajoute d'abord un message assistant vide prefixe
      setLoadingStage('processing');
      setHistory(h => [...h, { role: 'assistant', content: prefixedContent }]);
      const assistantIndex = newHistory.length; // position du message assistant insere
      let streamed = '';
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      await chatWithMistralStream(newHistory, { ...context, intent }, undefined, (chunk) => {
        streamed = chunk;
        const content = prefixedContent + streamed;
        setHistory(h => h.map((m, i) => (i === assistantIndex ? { ...m, content } : m)));
      }, controller.signal);
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50);
    } catch (e) {
      if (e?.name === 'AbortError') {
        // Interruption volontaire: ne rien afficher
      } else {
        console.error('Chat error:', e);
        
        // Diagnostic de l'erreur
        let errorMessage = "Une erreur serveur est survenue côté assistant.";
        
        if (e.message?.includes('API configuration error')) {
          errorMessage = "Erreur de configuration API. Veuillez contacter l'administrateur.";
        } else if (e.message?.includes('401') || e.message?.includes('Unauthorized')) {
          errorMessage = "Erreur d'authentification API. Veuillez réessayer plus tard.";
        } else if (e.message?.includes('429') || e.message?.includes('Too Many Requests')) {
          errorMessage = "Limite de requêtes atteinte. Veuillez réessayer dans quelques minutes.";
        } else if (e.message?.includes('500') || e.message?.includes('Internal Server Error')) {
          errorMessage = "Erreur serveur temporaire. Veuillez réessayer dans un instant.";
        }
        
        const fallbackHello = "Bonjour. Je reste à votre disposition pour la recherche et vos questions.";
        const fallbackError = hasSuggestions
          ? `${errorMessage} Vous pouvez cliquer sur « Voir plus » pour ouvrir tous les résultats, ou réessayer dans un instant.`
          : `${errorMessage} Veuillez réessayer dans un instant ou lancer la recherche complète depuis le marketplace.`;
        
        setHistory(h => [
          ...h,
          { role: 'assistant', content: fallbackHello },
          { role: 'assistant', content: fallbackError }
        ]);
      }
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

        const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    
    // Creer une nouvelle conversation si c'est le premier message
    if (history.length === 0) {
      const newConversationId = Date.now().toString();
      setCurrentConversationId(newConversationId);
      setConversations(prev => [...prev, {
        id: newConversationId,
        title: msg.length > 30 ? msg.substring(0, 30) + '...' : msg,
        date: new Date().toLocaleDateString(),
        messages: []
      }]);
    }
    
    const newHistory = [...history, { role: 'user', content: msg }];
    setHistory(newHistory);
    setInput('');
    setLoading(true);
    setLoadingStage('thinking');
    
    // Utiliser la fonction processMessage
    await processMessage(msg, newHistory);
  };

  const newChat = () => {
    try { abortRef.current?.abort(); } catch {}
    
    // Sauvegarder la conversation actuelle si elle existe
    if (history.length > 0 && currentConversationId) {
      const firstUserMessage = history.find(h => h.role === 'user')?.content || 'Nouvelle conversation';
      const title = firstUserMessage.length > 30 ? firstUserMessage.substring(0, 30) + '...' : firstUserMessage;
      
      const updatedConversations = conversations.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: history, title }
          : conv
      );
      setConversations(updatedConversations);
    }
    
    // Creer une nouvelle conversation
    const newConversationId = Date.now().toString();
    setCurrentConversationId(newConversationId);
    setHistory([]);
    setInput('');
    setLoading(false);
    
    // Remonter en haut
    setTimeout(() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  // Generer des suggestions intelligentes basees sur l'historique
  const getSmartSuggestions = () => {
    const suggestions = [];
    
    // Analyser l'historique pour detecter les patterns
    const userMessages = history.filter(h => h.role === 'user').map(h => h.content.toLowerCase());
    const hasSearchedRealEstate = userMessages.some(msg => 
      msg.includes('immobilier') || msg.includes('appartement') || msg.includes('maison') || msg.includes('terrain')
    );
    const hasSearchedCars = userMessages.some(msg => 
      msg.includes('voiture') || msg.includes('auto') || msg.includes('véhicule')
    );
    const hasSearchedServices = userMessages.some(msg => 
      msg.includes('service') || msg.includes('plomberie') || msg.includes('électricité')
    );
    
    // Suggestions basees sur l'historique
    if (hasSearchedRealEstate) {
      suggestions.push(
        { text: 'Appartements 2 chambres à Dakar', icon: '🏠' },
        { text: 'Terrains constructibles', icon: '🏗️' }
      );
    }
    if (hasSearchedCars) {
      suggestions.push(
        { text: 'Voitures d\'occasion récentes', icon: '🚗' },
        { text: 'Motos économiques', icon: '🏍️' }
      );
    }
    if (hasSearchedServices) {
      suggestions.push(
        { text: 'Services de nettoyage', icon: '🧹' },
        { text: 'Réparation électroménager', icon: '🔧' }
      );
    }
    
    // Suggestions par defaut si pas d'historique
    if (suggestions.length === 0) {
      suggestions.push(
        { text: 'Immobilier à Dakar', icon: '🏠' },
        { text: 'Voitures < 3 000 000 XOF', icon: '🚗' }
      );
    }
    
    return suggestions.slice(0, 3); // Max 3 suggestions
  };

  // Obtenir l'historique des conversations
  const getConversationHistory = () => {
    return conversations
      .map(conv => ({
        id: conv.id,
        title: conv.title || 'Conversation sans titre',
        date: conv.date || new Date(conv.id).toLocaleDateString(),
        messageCount: conv.messages?.length || 0
      }))
      .slice(-10) // Dernieres 10 conversations
      .reverse(); // Plus recent en premier
  };

  // Obtenir les statistiques de conversation
  const getConversationStats = () => {
    const userMessages = history.filter(h => h.role === 'user').length;
    const assistantMessages = history.filter(h => h.role === 'assistant').length;
    const totalMessages = history.length;
    
    return {
      userMessages,
      assistantMessages,
      totalMessages,
      sessionDuration: history.length > 0 ? Math.floor((Date.now() - new Date().getTime()) / 60000) : 0
    };
  };

  // Actions contextuelles
  const handleAction = (action, data = {}) => {
    switch (action) {
      case 'publish_listing':
        window.location.href = '/creer-annonce';
        break;
      case 'my_listings':
        if (user) {
          window.location.href = '/mes-annonces';
        } else {
          setHistory(h => [...h, { 
            role: 'assistant', 
            content: 'Vous devez être connecté pour voir vos annonces. Connectez-vous d\'abord.' 
          }]);
        }
        break;
      case 'contact_seller':
        if (context.listing?.sellerId) {
          // Rediriger vers la page de contact ou ouvrir modal
          window.location.href = `/annonce/${context.listing.id}#contact`;
        } else {
          setHistory(h => [...h, { 
            role: 'assistant', 
            content: 'Informations de contact non disponibles pour cette annonce.' 
          }]);
        }
        break;
      case 'share_listing':
        if (context.listing?.id) {
          const url = `${window.location.origin}/annonce/${context.listing.id}`;
          if (navigator.share) {
            navigator.share({
              title: context.listing.title || 'Annonce MaxiMarket',
              url: url
            });
          } else {
            navigator.clipboard.writeText(url);
            setHistory(h => [...h, { 
              role: 'assistant', 
              content: 'Lien copié dans le presse-papiers !' 
            }]);
          }
        }
        break;
      default:
        break;
    }
  };

  return (
    <div>
      {/* Bulle flottante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le chat"
          style={{
            position: 'fixed',
            bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            right: 'calc(16px + env(safe-area-inset-right, 0px))',
            zIndex: 9999,
            width: 'auto',
            height: 48,
            padding: '0 14px',
            borderRadius: 28,
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)';
            e.target.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
            e.target.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>⚡</span>
          Demander à AIDA
        </button>
      )}

      {open && (
        <>
          {/* Overlay pour fermer en cliquant à l'extérieur */}
          <div 
            onClick={() => {
              setOpen(false);
              setShowMenu(false);
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
              background: 'rgba(0,0,0,0.3)'
            }}
          />
          {/* Overlay pour fermer le menu hamburger en cliquant ailleurs */}
          {showMenu && (
            <div 
              onClick={() => setShowMenu(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9997,
                background: 'transparent'
              }}
            />
          )}
          <div style={{
            position: 'fixed',
            bottom: isMobile ? 'calc(16px + env(safe-area-inset-bottom, 0px))' : 20,
            right: isMobile ? 'calc(16px + env(safe-area-inset-right, 0px))' : 20,
            left: 'auto',
            top: 'auto',
            zIndex: 9999,
                      width: isMobile ? '80vw' : 420,
          maxWidth: isMobile ? '95vw' : '95vw',
          height: isMobile ? '90vw' : 560,
            maxHeight: isMobile ? '78vh' : '78vh',
            background: '#0b0f14', border: '1px solid #111827', borderRadius: 16,
            display: 'flex', flexDirection: 'column', boxShadow: '0 18px 38px rgba(0,0,0,0.6)'
          }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0e141b', position: isMobile ? 'sticky' : 'static', top: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 10, 
                    background: 'linear-gradient(135deg,#111827,#0b0f14)', 
                    color: '#fff', 
                    display: 'grid', 
                    placeItems: 'center', 
                    border: '1px solid #1f2937',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg,#1f2937,#111827)'}
                  onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg,#111827,#0b0f14)'}
                >
                  {showMenu ? (
                    // Icone X quand le menu est ouvert
                    <div style={{ 
                      position: 'relative', 
                      width: 16, 
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{ 
                        position: 'absolute', 
                        width: 16, 
                        height: 2, 
                        background: '#e5e7eb', 
                        borderRadius: 1,
                        transform: 'rotate(45deg)',
                        transition: 'all 0.2s'
                      }}></div>
                      <div style={{ 
                        position: 'absolute', 
                        width: 16, 
                        height: 2, 
                        background: '#e5e7eb', 
                        borderRadius: 1,
                        transform: 'rotate(-45deg)',
                        transition: 'all 0.2s'
                      }}></div>
                    </div>
                  ) : (
                    // Icone hamburger quand le menu est ferme
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ width: 16, height: 2, background: '#e5e7eb', borderRadius: 1 }}></div>
                      <div style={{ width: 16, height: 2, background: '#e5e7eb', borderRadius: 1 }}></div>
                      <div style={{ width: 16, height: 2, background: '#e5e7eb', borderRadius: 1 }}></div>
                    </div>
                  )}
                </button>
                
                {/* Menu déroulant */}
                {showMenu && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: 280,
                      background: '#0b0f14',
                      border: '1px solid #1f2937',
                      borderRadius: 12,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      zIndex: 10000,
                      marginTop: 8,
                      padding: 16
                    }}
                  >
                    {/* En-tête du menu */}
                    <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: 12, marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, color: '#e5e7eb', fontSize: 14, marginBottom: 4 }}>AIDA</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>
                        {getConversationStats().totalMessages} messages • {getConversationStats().userMessages} recherches
                      </div>
                    </div>

                    {/* Historique des conversations */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>CONVERSATIONS RÉCENTES</div>
                      <div style={{ maxHeight: 120, overflowY: 'auto' }}>
                        {getConversationHistory().length > 0 ? (
                          getConversationHistory().map((conv, index) => (
                            <button
                              key={conv.id}
                              onClick={() => {
                                // Charger cette conversation
                                const conversation = conversations.find(c => c.id === conv.id);
                                if (conversation) {
                                  setHistory(conversation.messages || []);
                                  setCurrentConversationId(conv.id);
                                  setShowMenu(false);
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                color: '#e5e7eb',
                                fontSize: 12,
                                textAlign: 'left',
                                borderRadius: 6,
                                cursor: 'pointer',
                                marginBottom: 2,
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#1f2937'}
                              onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#6b7280' }}></div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                    {conv.title}
                                  </div>
                                  <div style={{ fontSize: 10, color: '#9ca3af' }}>
                                    {conv.date} • {conv.messageCount} messages
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
                            Aucune conversation récente
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions rapides */}
                    <div style={{ borderTop: '1px solid #1f2937', paddingTop: 12 }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>ACTIONS RAPIDES</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button
                          onClick={() => {
                            handleAction('publish_listing');
                            setShowMenu(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 12px',
                            background: 'transparent',
                            border: '1px solid #374151',
                            color: '#e5e7eb',
                            fontSize: 12,
                            borderRadius: 6,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#1f2937'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          📝 Publier une annonce
                        </button>
                        {user && (
                          <button
                            onClick={() => {
                              handleAction('my_listings');
                              setShowMenu(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '6px 12px',
                              background: 'transparent',
                              border: '1px solid #374151',
                              color: '#e5e7eb',
                              fontSize: 12,
                              borderRadius: 6,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#1f2937'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            📋 Mes annonces
                          </button>
                        )}
                        <button
                          onClick={() => {
                            newChat();
                            setShowMenu(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 12px',
                            background: 'transparent',
                            border: '1px solid #374151',
                            color: '#e5e7eb',
                            fontSize: 12,
                            borderRadius: 6,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#1f2937'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          🆕 Nouveau chat
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#e5e7eb', fontSize: 15 }}>AIDA</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={newChat} title="Nouveau chat" aria-label="Nouveau chat" style={{ width: 32, height: 32, border: '1px solid #374151', background: '#0b0f14', color: '#e5e7eb', borderRadius: 8, display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 16 }}>+</button>
              {loading && (
                <button onClick={() => abortRef.current?.abort()} title="Arrêter" style={{ width: 32, height: 32, border: '1px solid #374151', background: '#0b0f14', color: '#e5e7eb', borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>⏹</button>
              )}
              <button onClick={() => {
                setOpen(false);
                setShowMenu(false);
              }} aria-label="Fermer" style={{ width: 32, height: 32, border: '1px solid #374151', background: '#0b0f14', color: '#e5e7eb', borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 600 }}>×</button>
            </div>
          </div>

          <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: 14, paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))' }}>
            {history.length === 0 && !showMenu && (
              <div style={{ fontSize: 14, color: '#9ca3af' }}>
                <SuggestionChips 
                  suggestions={[
                    ...getSmartSuggestions(),
                    { text: 'Publier une annonce', icon: '📝' },
                    { text: 'Services plomberie', icon: '🔧' },
                    { text: user ? 'Voir mes annonces' : 'Se connecter', icon: user ? '📋' : '🔐' }
                  ]}
                  onSuggestionClick={(suggestion) => {
                    const text = suggestion.text || suggestion;
                    if (text === 'Publier une annonce') {
                      handleAction('publish_listing');
                    } else if (text === 'Voir mes annonces') {
                      handleAction('my_listings');
                    } else if (text === 'Se connecter') {
                      window.location.href = '/connexion';
                    } else {
                      // Déclencher directement l'envoi du message
                      setInput(text);
                      // Simuler l'envoi après un court délai pour que l'input se mette à jour
                      setTimeout(() => {
                        const msg = text.trim();
                        if (msg && !loading) {
                          // Créer une nouvelle conversation si c'est le premier message
                          if (history.length === 0) {
                            const newConversationId = Date.now().toString();
                            setCurrentConversationId(newConversationId);
                            setConversations(prev => [...prev, {
                              id: newConversationId,
                              title: msg.length > 30 ? msg.substring(0, 30) + '...' : msg,
                              date: new Date().toLocaleDateString(),
                              messages: []
                            }]);
                          }
                          
                          const newHistory = [...history, { role: 'user', content: msg }];
                          setHistory(newHistory);
                          setInput('');
                          setLoading(true);
                          setLoadingStage('thinking');
                          
                          // Traiter la suggestion comme un message normal
                          processMessage(msg, newHistory);
                        }
                      }, 100);
                    }
                  }}
                />
                {/* Actions contextuelles si on est sur une page d'annonce */}
                {context.listing && !showMenu && (
                  <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid #1f2937' }}>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Actions rapides :</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <button 
                        onClick={() => handleAction('contact_seller')}
                        style={{ 
                          padding: '4px 8px', 
                          border: '1px solid #374151', 
                          borderRadius: 6, 
                          background: '#0e141b', 
                          color: '#e5e7eb',
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        Contacter le vendeur
                      </button>
                      <button 
                        onClick={() => handleAction('share_listing')}
                        style={{ 
                          padding: '4px 8px', 
                          border: '1px solid #374151', 
                          borderRadius: 6, 
                          background: '#0e141b', 
                          color: '#e5e7eb',
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        Partager
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {history.map((m, idx) => (
              <MessageBubble 
                key={idx} 
                message={m} 
                isUser={m.role === 'user'}
              />
            ))}
            
            {/* Suggestions intelligentes après la réponse d'AIDA */}
            {!loading && !showMenu && intelligentSuggestions && Object.keys(intelligentSuggestions).length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
                  💡 Suggestions intelligentes d'AIDA
                </div>
                {Object.entries(intelligentSuggestions).map(([category, suggestions]) => (
                  suggestions.length > 0 && (
                    <div key={category} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase' }}>
                        {category === 'immediate' && 'Recommandations immédiates'}
                        {category === 'contextual' && 'Actions contextuelles'}
                        {category === 'trending' && 'Tendances du marché'}
                        {category === 'personalized' && 'Personnalisé pour vous'}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {suggestions.slice(0, 3).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              const text = suggestion.value || suggestion.text || suggestion;
                              setInput(text);
                              setTimeout(() => {
                                const msg = text.trim();
                                if (msg && !loading) {
                                  const newHistory = [...history, { role: 'user', content: msg }];
                                  setHistory(newHistory);
                                  setInput('');
                                  setLoading(true);
                                  setLoadingStage('thinking');
                                  processMessage(msg, newHistory);
                                }
                              }, 100);
                            }}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #374151',
                              borderRadius: 8,
                              background: 'linear-gradient(135deg, #1f2937, #111827)',
                              color: '#e5e7eb',
                              fontSize: 12,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #374151, #1f2937)'}
                            onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #1f2937, #111827)'}
                          >
                            <span>{suggestion.icon || '💬'}</span>
                            <span>{suggestion.value || suggestion.text || suggestion}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
            {loading && (
              <div style={{ margin: '10px 0' }}>
                {advancedThinking && thinkingSteps.length > 0 ? (
                  <AdvancedThinkingIndicator 
                    steps={thinkingSteps}
                    currentStep={currentThinkingStep}
                    onStepComplete={(stepIndex) => {
                      console.log(`Étape ${stepIndex + 1} terminée`);
                    }}
                  />
                ) : loadingStage === 'thinking' ? (
                  <TypingIndicator message="AIDA réfléchit à votre demande..." />
                ) : loadingStage === 'searching' ? (
                  <ProgressBar
                    duration={2000} 
                    message="AIDA recherche des annonces..." 
                  />
                ) : null}
                {loadingStage === 'processing' && (
                  <TypingIndicator message="AIDA rédige sa réponse..." />
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, padding: 12, paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid #1f2937', background: '#0e141b', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              placeholder="Votre message..."
              style={{ background: '#0b0f14', color: '#e5e7eb', borderColor: '#1f2937' }}
            />
            <Button onClick={send} disabled={loading || !input.trim()} style={{ background: '#111827', border: '1px solid #1f2937' }}>Envoyer</Button>
            {hasSuggestions && (
            <Button
              variant="outline"
              onClick={() => {
                const lastUser = history.filter(h => h.role === 'user').slice(-1)[0]?.content || '';
                const intent = resolveSearchIntent(lastUser);
                const params = new URLSearchParams();
                if (intent?.params?.search) params.set('search', intent.params.search);
                if (intent?.params?.minPrice) params.set('minPrice', intent.params.minPrice);
                if (intent?.params?.maxPrice) params.set('maxPrice', intent.params.maxPrice);
                if (intent?.params?.location) params.set('location', intent.params.location);
                window.location.href = `/marketplace?${params.toString()}`;
              }}
              style={{ border: '1px solid #374151', color: '#e5e7eb' }}
            >Voir plus</Button>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;

