import React from 'react';

const SuggestionChips = ({ 
  suggestions = [], 
  onSuggestionClick, 
  className = "" 
}) => {
  return (
    <div className={`suggestions-container ${className}`}>
      <div className="suggestions-label">
        💡 Suggestions rapides
      </div>
      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="suggestion-chip"
            onClick={() => onSuggestionClick?.(suggestion)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="chip-icon">
              {suggestion.icon || '💬'}
            </span>
            <span className="chip-text">
              {suggestion.text || suggestion}
            </span>
          </button>
        ))}
      </div>
      
      <style jsx>{`
        .suggestions-container {
          margin: 16px 0;
          animation: slideIn 0.4s ease-out;
        }
        
        .suggestions-label {
          font-size: 12px;
          color: #a0aec0;
          margin-bottom: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .suggestions-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .suggestion-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
          border: 1px solid #4a5568;
          border-radius: 20px;
          color: #e2e8f0;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          animation: chipSlideIn 0.3s ease-out forwards;
          opacity: 0;
          transform: translateY(10px);
        }
        
        .suggestion-chip:hover {
          background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .suggestion-chip:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(102, 126, 234, 0.2);
        }
        
        .chip-icon {
          font-size: 14px;
          opacity: 0.8;
        }
        
        .chip-text {
          white-space: nowrap;
        }
        
        @keyframes chipSlideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Responsive */
        @media (max-width: 640px) {
          .suggestions-grid {
            gap: 6px;
          }
          
          .suggestion-chip {
            padding: 6px 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default SuggestionChips;
