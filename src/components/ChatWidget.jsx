import React, { useEffect, useMemo, useRef, useState } from 'react';
import { chatWithMistral, chatWithMistralStream } from '@/lib/mistralClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolveSearchIntent } from '@/lib/search-intent';
import { listingService } from '@/services/supabase.service';

const ChatWidget = ({ pageContext = {} }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]); // {role, content}
  const [hasSuggestions, setHasSuggestions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const listRef = useRef(null);
  const abortRef = useRef(null);

  const context = useMemo(() => ({
    path: window.location.pathname,
    ...(typeof window !== 'undefined' && window.__BENOME_CONTEXT ? window.__BENOME_CONTEXT : {}),
    ...pageContext,
  }), [pageContext]);

  // Détecter mobile et gérer le resize
  useEffect(() => {
    const update = () => setIsMobile(window.matchMedia('(max-width: 640px)').matches);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // (Mobile flottant => pas de scroll lock nécessaire)

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    const newHistory = [...history, { role: 'user', content: msg }];
    setHistory(newHistory);
    setInput('');
    setLoading(true);
    try {
      // Détection d'intention de recherche simple
      const intent = resolveSearchIntent(msg);

      // Si l'intention est une recherche, tenter une requête de 3 résultats
      let prefixedContent = '';
      let suggestions = [];
      setHasSuggestions(false);
      if (intent) {
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

      // Streaming: on ajoute d'abord un message assistant vide préfixé
      setHistory(h => [...h, { role: 'assistant', content: prefixedContent }]);
      const assistantIndex = newHistory.length; // position du message assistant inséré
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
        const fallbackHello = "Bonjour. Je reste à votre disposition pour la recherche et vos questions.";
        const fallbackError = hasSuggestions
          ? "Une erreur serveur est survenue côté assistant. Vous pouvez cliquer sur « Voir plus » pour ouvrir tous les résultats, ou réessayer dans un instant."
          : "Une erreur serveur est survenue côté assistant. Veuillez réessayer dans un instant ou lancer la recherche complète depuis le marketplace.";
        setHistory(h => [
          ...h,
          { role: 'assistant', content: fallbackHello },
          { role: 'assistant', content: fallbackError }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    try { abortRef.current?.abort(); } catch {}
    setHistory([]);
    setInput('');
    setLoading(false);
    // Remonter en haut
    setTimeout(() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
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
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg,#111827,#0b0f14)', color: 'white', border: '1px solid #1f2937',
            boxShadow: '0 10px 30px rgba(0,0,0,0.55)', display: 'grid', placeItems: 'center'
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12c0 4.418-4.03 8-9 8-1.032 0-2.021-.152-2.94-.432L3 21l1.49-4.47C3.55 15.19 3 13.65 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" stroke="#e5e7eb" strokeWidth="1.2"/>
            <path d="M7.5 11h9M7.5 14h5" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      {open && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? 'calc(16px + env(safe-area-inset-bottom, 0px))' : 20,
          right: isMobile ? 'calc(16px + env(safe-area-inset-right, 0px))' : 20,
          left: 'auto',
          top: 'auto',
          zIndex: 9999,
          width: isMobile ? '60vw' : 420,
          maxWidth: isMobile ? '95vw' : '95vw',
          height: isMobile ? '65vh' : 560,
          maxHeight: isMobile ? '78vh' : '78vh',
          background: '#0b0f14', border: '1px solid #111827', borderRadius: 16,
          display: 'flex', flexDirection: 'column', boxShadow: '0 18px 38px rgba(0,0,0,0.6)'
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0e141b', position: isMobile ? 'sticky' : 'static', top: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#111827,#0b0f14)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, border: '1px solid #1f2937', letterSpacing: 0.3 }}>M</div>
              <div>
                <div style={{ fontWeight: 700, color: '#e5e7eb' }}>Assistant MaxiMarket</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Trouver des annonces, répondre aux questions</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={newChat} title="Nouveau chat" aria-label="Nouveau chat" style={{ border: '1px solid #374151', background: '#0b0f14', color: '#e5e7eb', borderRadius: 8, padding: '4px 8px', fontWeight: 700 }}>+</button>
              {loading && (
                <button onClick={() => abortRef.current?.abort()} title="Arrêter" style={{ border: '1px solid #374151', background: '#0b0f14', color: '#e5e7eb', borderRadius: 8, padding: '4px 8px' }}>Stop</button>
              )}
              <button onClick={() => setOpen(false)} aria-label="Fermer" style={{ border: '1px solid #374151', background: '#0b0f14', color: '#e5e7eb', borderRadius: 8, padding: '4px 8px' }}>Fermer</button>
            </div>
          </div>

          <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: 14, paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))' }}>
            {history.length === 0 && (
              <div style={{ fontSize: 14, color: '#9ca3af' }}>
                Bonjour. Je suis l’assistant Maximarket. Indiquez ce que vous recherchez (catégorie, budget, ville) ou posez votre question.
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Immobilier à Dakar', 'Voitures &lt; 3 000 000 XOF', 'Publier une annonce', 'Services plomberie'].map((s, i) => (
                    <button key={i} onClick={() => setInput(s)} style={{ padding: '6px 10px', border: '1px solid #374151', borderRadius: 999, background: '#0e141b', color: '#e5e7eb' }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {history.map((m, idx) => (
              <div key={idx} style={{ margin: '10px 0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.role === 'user' ? '#111827' : '#0e141b', color: '#e5e7eb', display: 'grid', placeItems: 'center', fontSize: 12, border: '1px solid #1f2937' }}>
                  {m.role === 'user' ? 'Vous' : 'AI'}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', background: m.role === 'user' ? '#0e141b' : '#0b0f14', border: '1px solid #1f2937', color: '#e5e7eb', borderRadius: 12, padding: '10px 12px', maxWidth: '85%' }}>{m.content}</div>
              </div>
            ))}
            {loading && <div style={{ color: '#9ca3af', fontSize: 14 }}>Rédaction…</div>}
          </div>

          <div style={{ display: 'flex', gap: 8, padding: 12, paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid #1f2937', background: '#0e141b', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              placeholder="Votre message…"
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
      )}
    </div>
  );
};

export default ChatWidget;

