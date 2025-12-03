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
import { ChevronUp, ChevronDown, Maximize2, Minimize2, X } from 'lucide-react'; // Assure-toi d'avoir ces icônes ou remplace-les

const ChatWidget = ({ pageContext = {} }) => {
  // Masquer le widget sur la page de messagerie
  const currentPath = window.location.pathname;
  const isMessagingPage = currentPath === '/messages';
  
  if (isMessagingPage) {
    return null;
  }

  const { user } = useAuth();
  
  // États d'interface
  const [open, setOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState('initial'); // 'initial' (semi) | 'full' (fullscreen)
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // États de logique Chat
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [history, setHistory] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [hasSuggestions, setHasSuggestions] = useState(false);
  const [advancedThinking, setAdvancedThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [currentThinkingStep, setCurrentThinkingStep] = useState(0);
  const [userContext, setUserContext] = useState(null);
  const [intelligentSuggestions, setIntelligentSuggestions] = useState([]);
  
  // Refs
  const listRef = useRef(null);
  const abortRef = useRef(null);
  const touchStartRef = useRef(null); // Pour le swipe

  const context = useMemo(() => ({
    path: window.location.pathname,
    ...(typeof window !== 'undefined' && window.__MAXIMARKET_CONTEXT ? window.__MAXIMARKET_CONTEXT : {}),
    ...pageContext,
  }), [pageContext]);

  // --- EFFETS ---

  // Charger les conversations
  useEffect(() => {
    const savedConversations = localStorage.getItem('chatbot_conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        if (Array.isArray(parsed)) setConversations(parsed);
      } catch (e) { console.error('Erreur parsing conversations:', e); }
    }
  }, []);

  // Sauvegarder les conversations
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('chatbot_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Détecter Mobile et Resize
  useEffect(() => {
    const update = () => setIsMobile(window.matchMedia('(max-width: 640px)').matches);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Initialiser AIDA Context
  useEffect(() => {
    const initializeAIDAContext = async () => {
      try {
        const searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
        const context = await aidaIntelligenceService.analyzeUserContext(
          user?.id,
          window.location.pathname,
          searchHistory
        );
        setUserContext(context);
        if (context) {
          const recommendations = await aidaIntelligenceService.generateRecommendations(context, '');
          setIntelligentSuggestions(recommendations);
        }
      } catch (error) { console.error('Erreur initialisation AIDA:', error); }
    };

    if (open) {
      initializeAIDAContext();
    }
  }, [open, user?.id]);


  // --- LOGIQUE GESTURES (SWIPE) ---

  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    
    const touchY = e.touches[0].clientY;
    const diff = touchStartRef.current - touchY;

    // Si on tire vers le haut (diff positif) et qu'on est en mode initial
    if (diff > 50 && sheetMode === 'initial') {
      setSheetMode('full');
      touchStartRef.current = null; // Reset
    }
    
    // Si on tire vers le bas (diff négatif)
    if (diff < -50) {
      if (sheetMode === 'full') {
        setSheetMode('initial');
      } else {
        setOpen(false); // Fermer si on tire vers le bas en mode initial
      }
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const toggleSheetMode = () => {
    setSheetMode(prev => prev === 'initial' ? 'full' : 'initial');
  };

  // --- LOGIQUE CHAT ---

  const processMessage = async (msg, newHistory) => {
    try {
      const isComplexQuery = msg.length > 20 || /\b(prix|marché|tendance|recommandation|suggestion|analyse|comparaison)\b/i.test(msg);
      
      if (isComplexQuery && userContext) {
        setAdvancedThinking(true);
        const steps = aidaIntelligenceService.getAdvancedThinkingSteps(userContext, msg);
        setThinkingSteps(steps);
        setCurrentThinkingStep(0);
        
        for (let i = 0; i < steps.length; i++) {
          setCurrentThinkingStep(i);
          await new Promise(resolve => setTimeout(resolve, steps[i].duration));
        }
        
        const recommendations = await aidaIntelligenceService.generateRecommendations(userContext, msg);
        setIntelligentSuggestions(recommendations);
      }

      const isGreeting = /^(yo|salut|bonjour|hello|hi|hey|ciao|hola|bonsoir|bonne\s+nuit)$/i.test(msg.trim());
      const hasSearchKeywords = /\b(appartement|maison|voiture|service|immobilier|auto|plombier|electricien|terrain|studio|villa|moto|scooter|camion|menage|jardinage|coiffure|reparation|demenagement|cours|prof|informatique|evenementiel)\b/i.test(msg.toLowerCase());
      const hasPriceOrLocation = /\d+\s*(k|m|xof|frs?)|(dakar|abidjan|lome|cotonou|thiès|saint-louis|kaolack|ziguinchor|touba|mbour|rufisque|pikine|guediawaye)/i.test(msg.toLowerCase());

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
        const categoryMap = { immobilier: 'real_estate', automobile: 'automobile', services: 'services', marketplace: 'marketplace' };
        const filters = { ...params, category: categoryMap[section] || undefined, limit: 3, page: 0, status: 'approved' };
        try {
          const result = await listingService.getAllListings(filters);
          if (result?.data?.length) {
            suggestions = result.data.slice(0, 3).map(l => ({ id: l.id, title: l.title, price: l.price }));
            prefixedContent += `J'ai trouvé ${result.data.length} résultats. Voici quelques suggestions:\n` + suggestions.map(s => `• ${s.title} — ${s.price ?? ''} XOF (ouvrir: /annonce/${s.id})`).join('\n') + '\n\n';
            setHasSuggestions(true);
          }
        } catch {}
      }

      if (advancedThinking) {
        setAdvancedThinking(false);
        setThinkingSteps([]);
        setCurrentThinkingStep(0);
      }

      setLoadingStage('processing');
      setHistory(h => [...h, { role: 'assistant', content: prefixedContent }]);
      const assistantIndex = newHistory.length; 
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
      if (e?.name !== 'AbortError') {
        console.error('Chat error:', e);
        const fallbackError = "Désolé, une erreur est survenue. Veuillez réessayer.";
        setHistory(h => [...h, { role: 'assistant', content: fallbackError }]);
      }
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    
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
    
    await processMessage(msg, newHistory);
  };

  const newChat = () => {
    try { abortRef.current?.abort(); } catch {}
    
    if (history.length > 0 && currentConversationId) {
      const firstUserMessage = history.find(h => h.role === 'user')?.content || 'Nouvelle conversation';
      const title = firstUserMessage.length > 30 ? firstUserMessage.substring(0, 30) + '...' : firstUserMessage;
      setConversations(conversations.map(conv => conv.id === currentConversationId ? { ...conv, messages: history, title } : conv));
    }
    
    const newConversationId = Date.now().toString();
    setCurrentConversationId(newConversationId);
    setHistory([]);
    setInput('');
    setLoading(false);
    setTimeout(() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  // --- HELPERS ---

  const getSmartSuggestions = () => {
    const suggestions = [];
    const userMessages = history.filter(h => h.role === 'user').map(h => h.content.toLowerCase());
    
    if (userMessages.some(msg => msg.includes('immobilier'))) suggestions.push({ text: 'Appartements à Dakar', icon: '🏠' });
    if (userMessages.some(msg => msg.includes('voiture'))) suggestions.push({ text: 'Voitures occasion', icon: '🚗' });
    if (suggestions.length === 0) suggestions.push({ text: 'Immobilier', icon: '🏠' }, { text: 'Véhicules', icon: '🚗' });
    
    return suggestions.slice(0, 3);
  };

  const getConversationStats = () => ({
    userMessages: history.filter(h => h.role === 'user').length,
    totalMessages: history.length
  });

  const getConversationHistory = () => conversations.slice(-5).reverse();

  const handleAction = (action) => {
    if (action === 'publish_listing') window.location.href = '/creer-annonce';
    if (action === 'my_listings') window.location.href = user ? '/mes-annonces' : '/connexion';
  };

  return (
    <div>
      {/* Bouton Flottant (Launcher) */}
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setSheetMode('initial');
          }}
          aria-label="Ouvrir AIDA"
          style={{
            position: 'fixed',
            bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            right: 'calc(16px + env(safe-area-inset-right, 0px))',
            zIndex: 9999,
            height: 48,
            padding: '0 16px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: '20px' }}>✨</span>
          Demander à AIDA
        </button>
      )}

      {/* OVERLAY & SHEET CONTAINER */}
      {open && (
        <>
          {/* Backdrop (Fond sombre) */}
          <div 
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(2px)',
              transition: 'opacity 0.3s ease',
              opacity: 1
            }}
          />

          {/* MAIN WIDGET CONTAINER (Bottom Sheet on Mobile, Box on Desktop) */}
          <div 
            style={{
              position: 'fixed',
              left: isMobile ? 0 : 'auto',
              right: isMobile ? 0 : 20,
              bottom: 0, // Collé en bas sur mobile
              top: isMobile ? (sheetMode === 'full' ? 0 : 'auto') : 'auto',
              width: isMobile ? '100%' : 400,
              height: isMobile 
                ? (sheetMode === 'full' ? '100%' : '55vh') // 55% height initialement
                : 600, // Hauteur fixe sur desktop
              maxHeight: isMobile ? '100dvh' : 'calc(100vh - 40px)',
              zIndex: 9999,
              background: '#0b0f14',
              border: '1px solid #1f2937',
              borderBottom: 'none',
              borderRadius: isMobile ? '20px 20px 0 0' : '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
              transition: isMobile ? 'height 0.3s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
              overflow: 'hidden'
            }}
          >
            {/* HEADER / DRAG HANDLE */}
            <div 
              // Gestion du Drag uniquement sur le header
              onTouchStart={isMobile ? handleTouchStart : undefined}
              onTouchMove={isMobile ? handleTouchMove : undefined}
              onTouchEnd={isMobile ? handleTouchEnd : undefined}
              style={{ 
                padding: '0 16px',
                height: 56,
                borderBottom: '1px solid #1f2937', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: '#0e141b',
                flexShrink: 0,
                cursor: isMobile ? 'grab' : 'default',
                userSelect: 'none'
              }}
            >
              {/* Left Side: Menu + Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Drag Handle Visible on Mobile */}
                {isMobile && (
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 36,
                    height: 4,
                    background: '#374151',
                    borderRadius: 2
                  }} />
                )}

                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  style={{ 
                    width: 32, height: 32, 
                    borderRadius: 8, 
                    background: showMenu ? '#1f2937' : 'transparent',
                    border: 'none', 
                    color: '#9ca3af',
                    display: 'grid', placeItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ width: 14, height: 2, background: 'currentColor', borderRadius: 1 }}></div>
                    <div style={{ width: 14, height: 2, background: 'currentColor', borderRadius: 1 }}></div>
                    <div style={{ width: 14, height: 2, background: 'currentColor', borderRadius: 1 }}></div>
                  </div>
                </button>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, color: '#e5e7eb', fontSize: 15 }}>AIDA</span>
                  <span style={{ fontSize: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
                    En ligne
                  </span>
                </div>
              </div>

              {/* Right Side: Controls */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                 {/* Bouton Agrandir/Réduire (Visible Mobile) */}
                 {isMobile && (
                  <button 
                    onClick={toggleSheetMode}
                    style={{ padding: 8, color: '#9ca3af', background: 'transparent', border: 'none' }}
                  >
                    {sheetMode === 'initial' ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                  </button>
                )}

                <button 
                  onClick={newChat} 
                  title="Nouveau chat" 
                  style={{ width: 32, height: 32, background: '#1f2937', border: 'none', borderRadius: 8, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                >
                  +
                </button>
                
                <button 
                  onClick={() => setOpen(false)} 
                  style={{ width: 32, height: 32, background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* MENU DÉROULANT */}
            {showMenu && (
              <div style={{
                position: 'absolute',
                top: 56,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#0b0f14',
                zIndex: 20,
                padding: 16,
                overflowY: 'auto'
              }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 8, letterSpacing: 0.5 }}>HISTORIQUE</div>
                  {getConversationHistory().map(conv => (
                    <div 
                      key={conv.id}
                      onClick={() => {
                        const conversation = conversations.find(c => c.id === conv.id);
                        if (conversation) {
                          setHistory(conversation.messages || []);
                          setCurrentConversationId(conv.id);
                          setShowMenu(false);
                        }
                      }}
                      style={{ padding: '12px 0', borderBottom: '1px solid #1f2937', cursor: 'pointer' }}
                    >
                      <div style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 500 }}>{conv.title}</div>
                      <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{conv.date} • {conv.messageCount} messages</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 8, letterSpacing: 0.5 }}>ACTIONS</div>
                  <button onClick={() => { handleAction('publish_listing'); setShowMenu(false); }} style={{ display: 'block', width: '100%', padding: '12px', textAlign: 'left', background: '#1f2937', border: 'none', borderRadius: 8, color: '#e5e7eb', marginBottom: 8 }}>📝 Publier une annonce</button>
                  <button onClick={() => { handleAction('my_listings'); setShowMenu(false); }} style={{ display: 'block', width: '100%', padding: '12px', textAlign: 'left', background: '#1f2937', border: 'none', borderRadius: 8, color: '#e5e7eb' }}>📋 Mes annonces</button>
                </div>
              </div>
            )}

            {/* ZONE DE CHAT (SCROLLABLE) */}
            <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 20 }}>
              {history.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: 40, opacity: showMenu ? 0 : 1 }}>
                  <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '50%', margin: '0 auto 16px', display: 'grid', placeItems: 'center', fontSize: 24 }}>✨</div>
                  <h3 style={{ color: '#f3f4f6', margin: '0 0 8px', fontSize: 18 }}>Bonjour, je suis AIDA</h3>
                  <p style={{ color: '#9ca3af', fontSize: 14, maxWidth: 280, margin: '0 auto 24px', lineHeight: 1.5 }}>
                    Votre assistant personnel pour acheter, vendre et explorer sur MaxiMarket.
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 300, margin: '0 auto' }}>
                    <SuggestionChips 
                      suggestions={[
                        ...getSmartSuggestions(),
                        { text: 'Publier une annonce', icon: '📝' }
                      ]}
                      onSuggestionClick={(s) => {
                        const text = s.text || s;
                        if (text === 'Publier une annonce') handleAction('publish_listing');
                        else {
                          setInput(text);
                          setTimeout(() => processMessage(text, [...history, { role: 'user', content: text }]), 100);
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {history.map((m, idx) => (
                <MessageBubble key={idx} message={m} isUser={m.role === 'user'} />
              ))}

              {loading && (
                <div style={{ margin: '12px 0' }}>
                   {advancedThinking ? (
                      <AdvancedThinkingIndicator 
                        steps={thinkingSteps} 
                        currentStep={currentThinkingStep} 
                      />
                   ) : (
                     <TypingIndicator message={loadingStage === 'searching' ? "Je cherche..." : "Je rédige..."} />
                   )}
                </div>
              )}
              
              {/* Espace vide en bas pour éviter que le clavier ne cache le dernier message */}
              <div style={{ height: 20 }}></div>
            </div>

            {/* INPUT AREA */}
            <div style={{ 
              padding: '12px 16px', 
              paddingBottom: isMobile ? 'calc(16px + env(safe-area-inset-bottom, 0px))' : 16,
              background: '#0e141b', 
              borderTop: '1px solid #1f2937',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end'
            }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                  placeholder="Posez une question..."
                  style={{ 
                    background: '#1f2937', 
                    border: 'none', 
                    color: '#e5e7eb',
                    borderRadius: 20,
                    paddingRight: 40,
                    minHeight: 44
                  }}
                />
              </div>
              
              <button 
                onClick={send} 
                disabled={!input.trim() || loading}
                style={{
                  width: 44, height: 44,
                  borderRadius: '50%',
                  background: (!input.trim() || loading) ? '#374151' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  display: 'grid', placeItems: 'center',
                  cursor: (!input.trim() || loading) ? 'default' : 'pointer',
                  transition: 'background 0.2s',
                  flexShrink: 0
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;