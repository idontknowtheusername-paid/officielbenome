import React from 'react';

const SuggestionChips = ({ suggestions = [], onSuggestionClick }) => {
  // Sécurité si la liste est vide
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div style={{ marginTop: 12, marginBottom: 12 }}>
      {/* On injecte les keyframes localement pour être sûr que l'animation fonctionne partout */}
      <style>{`
        @keyframes chipSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Titre discret */}
      <div style={{ 
        fontSize: '11px', 
        fontWeight: '700', 
        color: '#6b7280', 
        marginBottom: '10px', 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em',
        paddingLeft: '4px'
      }}>
        💡 Suggestions rapides
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {suggestions.map((suggestion, index) => {
          // Gestion flexible (soit une string, soit un objet {text, icon})
          const text = typeof suggestion === 'string' ? suggestion : suggestion.text;
          const icon = typeof suggestion === 'object' && suggestion.icon ? suggestion.icon : '💬';

          return (
            <button
              key={index}
              onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                // Style Glassmorphism sombre
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '99px',
                color: '#e5e7eb',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                
                // Animation d'entrée
                animation: 'chipSlideIn 0.4s ease-out forwards',
                animationDelay: `${index * 0.05}s`,
                opacity: 0, // Sera passé à 1 par l'animation
                transform: 'translateY(10px)' // Sera passé à 0 par l'animation
              }}
              // Effets Hover en JS inline pour éviter les dépendances CSS externes
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'; // Teinte bleue au survol
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '14px', opacity: 0.9 }}>{icon}</span>
              <span>{text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestionChips;
