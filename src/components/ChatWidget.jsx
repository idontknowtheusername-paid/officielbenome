import React, { useEffect, useMemo, useRef, useState } from 'react';
import { chatWithMistralStream } from '@/lib/mistralClient';
import { Input } from '@/components/ui/input';
import { resolveSearchIntent } from '@/lib/search-intent';
import { listingService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import AdvancedThinkingIndicator from '@/components/ui/loading/AdvancedThinkingIndicator';
import MessageBubble from '@/components/ui/MessageBubble';
import SuggestionChips from '@/components/ui/SuggestionChips';
import { aidaIntelligenceService } from '@/services/aidaIntelligence.service';
import { 
  Maximize2, Minimize2, X, Sparkles, MoreHorizontal, 
  Bot, Clock, MessageSquare, ChevronRight 
} from 'lucide-react'; 

const ChatWidget = ({ pageContext = {} }) => {
  const currentPath = window.location.pathname;
  if (currentPath === '/messages') return null;

  const { user } = useAuth();
  
  // --- ÉTATS ---
  const [open, setOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState('initial');
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  
  const [advancedThinking, setAdvancedThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [currentThinkingStep, setCurrentThinkingStep] = useState(0);
  const [userContext, setUserContext] = useState(null);
  
  // Refs
  const listRef = useRef(null);
  const abortRef = useRef(null);
  const touchStartRef = useRef(null);

  const context = useMemo(() => ({
    path: window.location.pathname,
    ...(typeof window !== 'undefined' && window.__MAXIMARKET_CONTEXT ? window.__MAXIMARKET_CONTEXT : {}),
    ...pageContext,
  }), [pageContext]);

  // --- EFFETS ---
  useEffect(() => {
    const saved = localStorage.getItem('chatbot_conversations');
    if (saved) {
      try { setConversations(JSON.parse(saved)); } catch (e) {}
    }
    
    const updateMobile = () => setIsMobile(window.matchMedia('(max-width: 640px)').matches);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  useEffect(() => {
    if (conversations.length > 0) localStorage.setItem('chatbot_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (open && !userContext) {
      const initAIDA = async () => {
        try {
          const searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
          const ctx = await aidaIntelligenceService.analyzeUserContext(user?.id, window.location.pathname, searchHistory);
          setUserContext(ctx);
        } catch (e) {}
      };
      initAIDA();
    }
  }, [open, user?.id]);

  // --- GESTURES ---
  const handleTouchStart = (e) => { touchStartRef.current = e.touches[0].clientY; };
  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    const diff = touchStartRef.current - e.touches[0].clientY;
    if (diff > 50 && sheetMode === 'initial') { setSheetMode('full'); touchStartRef.current = null; }
    if (diff < -50) { 
      if (sheetMode === 'full') setSheetMode('initial'); 
      else setOpen(false); 
      touchStartRef.current = null; 
    }
  };
  const handleTouchEnd = () => { touchStartRef.current = null; };

  // --- LOGIQUE CHAT ---
  const processMessage = async (msg, newHistory) => {
    try {
      const isComplexQuery = msg.length > 20 || /\b(prix|marché|tendance|recommandation|analyse|comparaison)\b/i.test(msg);
      
      if (isComplexQuery && userContext) {
        setAdvancedThinking(true);
        const steps = aidaIntelligenceService.getAdvancedThinkingSteps(userContext, msg);
        setThinkingSteps(steps);
        for (let i = 0; i < steps.length; i++) {
          setCurrentThinkingStep(i);
          await new Promise(r => setTimeout(r, steps[i].duration));
        }
      }

      const isGreeting = /^(yo|salut|bonjour|hello|hi|hey)\b/i.test(msg.trim());
      const hasSearchKeywords = /\b(appart|maison|voiture|immo|auto|terrain)\b/i.test(msg.toLowerCase());
      
      let intent = null;
      let prefixedContent = '';
      
      if (!isGreeting && (hasSearchKeywords || isComplexQuery)) {
        intent = resolveSearchIntent(msg);
      }
      
      if (intent) {
        const filters = { ...intent.params, limit: 3, status: 'approved' };
        try {
          const result = await listingService.getAllListings(filters);
          if (result?.data?.length) {
            prefixedContent += `J'ai trouvé ${result.data.length} résultats :\n` + result.data.slice(0, 3).map(s => `• ${s.title} — ${s.price} XOF`).join('\n') + '\n\n';
          }
        } catch {}
      }

      if (advancedThinking) {
        setAdvancedThinking(false);
        setThinkingSteps([]);
      }

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
        if (listRef.current) listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'auto' });
      }, controller.signal);
      
    } catch (e) {
      if (e?.name !== 'AbortError') setHistory(h => [...h, { role: 'assistant', content: "Désolé, une erreur est survenue." }]);
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    
    // Si c'est le tout premier message absolu ou après un reset
    let convId = currentConversationId;
    if (history.length === 0) {
      convId = Date.now().toString();
      setCurrentConversationId(convId);
      const newConv = { id: convId, title: msg.substring(0, 30), date: new Date().toLocaleDateString(), messages: [] };
      setConversations(prev => [...prev, newConv]);
    }
    
    const newHistory = [...history, { role: 'user', content: msg }];
    setHistory(newHistory);
    
    // Mise à jour de la conversation courante dans la liste
    if (convId) {
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, messages: newHistory, title: msg.substring(0, 30) } : c));
    }

    setInput('');
    setLoading(true);
    await processMessage(msg, newHistory);
  };

  const newChat = () => {
    abortRef.current?.abort();
    setCurrentConversationId(Date.now().toString());
    setHistory([]);
    setInput('');
    setLoading(false);
    setShowMenu(false);
  };

  const loadConversation = (conv) => {
    setHistory(conv.messages || []);
    setCurrentConversationId(conv.id);
    setShowMenu(false);
    setOpen(true);
  };

  const handleAction = (action) => {
    if (action === 'publish_listing') window.location.href = '/creer-annonce';
    if (action === 'my_listings') window.location.href = user ? '/mes-annonces' : '/connexion';
    setShowMenu(false);
  };

  // --- RENDER ---
  return (
    <div>
      {/* LAUNCHER */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setSheetMode('initial'); }}
          style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
            height: 56, padding: '0 24px', borderRadius: 28,
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            color: 'white', border: 'none',
            boxShadow: '0 8px 32px rgba(37, 99, 235, 0.4)',
            display: 'flex', alignItems: 'center', gap: 12,
            fontSize: '15px', fontWeight: '600', cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Sparkles size={20} />
          <span>AIDA</span>
        </button>
      )}

      {/* WINDOW */}
      {open && (
        <>
          <div 
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />

          <div 
            style={{
              position: 'fixed',
              left: isMobile ? 0 : 'auto', right: isMobile ? 0 : 24,
              bottom: isMobile ? 0 : 24,
              top: isMobile ? (sheetMode === 'full' ? 0 : 'auto') : 'auto',
              width: isMobile ? '100%' : 400,
              height: isMobile ? (sheetMode === 'full' ? '100%' : '60vh') : 650,
              maxHeight: '100dvh', zIndex: 9999,
              background: '#0f1115',
              border: '1px solid #1f2937',
              borderRadius: isMobile ? '24px 24px 0 0' : '20px',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden',
              transition: isMobile ? 'height 0.3s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
            }}
          >
            {/* HEADER */}
            <div 
              onTouchStart={isMobile ? handleTouchStart : undefined}
              onTouchMove={isMobile ? handleTouchMove : undefined}
              onTouchEnd={isMobile ? handleTouchEnd : undefined}
              style={{ 
                padding: '0 20px', height: 64,
                borderBottom: '1px solid rgba(255,255,255,0.05)', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                background: 'rgba(15, 17, 21, 0.9)', backdropFilter: 'blur(10px)',
                flexShrink: 0, userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {isMobile && <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 40, height: 4, background: '#374151', borderRadius: 2 }} />}
                
                <button onClick={() => setShowMenu(!showMenu)} style={{ background: showMenu ? '#1f2937' : 'transparent', border: 'none', color: '#9ca3af', padding: 8, borderRadius: 8, cursor: 'pointer' }}>
                  <MoreHorizontal size={20} />
                </button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
                    <Bot size={18} color="white" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: '#f3f4f6', fontSize: 14 }}>AIDA</span>
                    <span style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
                      Online
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {/* BOUTON AGRANDIR (MOBILE ONLY) - RÉTABLI */}
                {isMobile && (
                  <button 
                    onClick={() => setSheetMode(s => s === 'initial' ? 'full' : 'initial')}
                    style={{ background: 'transparent', border: 'none', color: '#9ca3af', padding: 8, cursor: 'pointer' }}
                  >
                    {sheetMode === 'initial' ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                  </button>
                )}

                <button onClick={newChat} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: 32, height: 32, borderRadius: 8, color: '#e5e7eb', cursor: 'pointer', display: 'grid', placeItems: 'center', marginLeft: 4 }}>+</button>
                
                <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', padding: 8, cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* MENU (AVEC HISTORIQUE RÉTABLI) */}
            {showMenu && (
              <div style={{ 
                position: 'absolute', top: 64, left: 0, right: 0, bottom: 0, 
                background: '#0f1115', zIndex: 20, padding: 20, overflowY: 'auto'
              }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 10, letterSpacing: 0.5 }}>ACTIONS RAPIDES</h4>
                <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
                  <button onClick={() => handleAction('publish_listing')} style={{ width: '100%', padding: 14, background: '#1f2937', border: 'none', borderRadius: 12, color: 'white', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>📝</span> Publier une annonce
                  </button>
                  <button onClick={() => handleAction('my_listings')} style={{ width: '100%', padding: 14, background: '#1f2937', border: 'none', borderRadius: 12, color: 'white', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>📋</span> Mes annonces
                  </button>
                </div>

                {/* HISTORIQUE DES CONVERSATIONS */}
                <h4 style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 10, letterSpacing: 0.5, borderTop: '1px solid #1f2937', paddingTop: 20 }}>HISTORIQUE</h4>
                {conversations.length === 0 ? (
                  <div style={{ color: '#4b5563', fontSize: 13, fontStyle: 'italic' }}>Aucune conversation récente.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {conversations.slice().reverse().map(conv => (
                      <div 
                        key={conv.id}
                        onClick={() => loadConversation(conv)}
                        style={{ 
                          padding: '12px 0', borderBottom: '1px solid #1f2937', 
                          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
                            {conv.title || 'Conversation sans titre'}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={10} /> {conv.date} • {conv.messages?.length || 0} messages
                          </div>
                        </div>
                        <ChevronRight size={14} color="#4b5563" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CHAT LIST */}
            <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {history.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: 60, opacity: 0.8 }}>
                  <div style={{ width: 64, height: 64, background: 'rgba(37,99,235,0.1)', borderRadius: 20, margin: '0 auto 20px', display: 'grid', placeItems: 'center' }}>
                    <Sparkles size={32} color="#3b82f6" />
                  </div>
                  <h3 style={{ color: 'white', marginBottom: 8, fontSize: 18 }}>Bonjour</h3>
                  <p style={{ color: '#9ca3af', fontSize: 14, maxWidth: 260, margin: '0 auto 24px', lineHeight: 1.5 }}>
                    Je suis l'IA de MaxiMarket. Je peux vous aider à chercher, comparer ou vendre.
                  </p>
                  <SuggestionChips 
                    suggestions={[{text: 'Cherche un studio', icon:'🏠'}, {text: 'Prix iPhone 14', icon:'📱'}]}
                    onSuggestionClick={(s) => { setInput(s.text||s); send(); }}
                  />
                </div>
              )}

              {history.map((m, idx) => (
                <MessageBubble key={idx} message={m} isUser={m.role === 'user'} />
              ))}

              {loading && advancedThinking && (
                 <div style={{ marginTop: 16 }}>
                    <AdvancedThinkingIndicator steps={thinkingSteps} currentStep={currentThinkingStep} />
                 </div>
              )}
              <div style={{ height: 20 }}></div>
            </div>

            {/* INPUT */}
            <div style={{ padding: 16, background: '#0f1115', borderTop: '1px solid #1f2937' }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#1a1d24', borderRadius: 24, padding: '8px 8px 8px 20px',
                border: '1px solid #2d3748'
              }}>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                  placeholder="Écrivez votre message..."
                  style={{ 
                    background: 'transparent', border: 'none', color: 'white', 
                    fontSize: 15, padding: 0, height: 'auto', flex: 1, outline: 'none', boxShadow: 'none'
                  }}
                />
                <button 
                  onClick={send} 
                  disabled={!input.trim() || loading}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: input.trim() ? '#3b82f6' : '#2d3748',
                    color: 'white', border: 'none',
                    display: 'grid', placeItems: 'center', cursor: input.trim() ? 'pointer' : 'default',
                    transition: 'background 0.2s'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;