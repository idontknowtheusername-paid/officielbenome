import React from 'react';

const TypingIndicator = ({ 
  message = "AIDA réfléchit...", 
  showDots = true, 
  className = "" 
}) => {
  return (
    <div className={`typing-indicator ${className}`}>
      <div className="typing-avatar">
        <div className="avatar-pulse"></div>
        <div className="avatar-icon">🤖</div>
      </div>
      
      <div className="typing-content">
        <div className="typing-message">{message}</div>
        {showDots && (
          <div className="typing-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: linear-gradient(135deg, #0e141b 0%, #1a1f2e 100%);
          border: 1px solid #2d3748;
          border-radius: 16px;
          margin: 8px 0;
          animation: slideIn 0.3s ease-out;
        }
        
        .typing-avatar {
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .avatar-pulse {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          opacity: 0.3;
          animation: pulse 2s infinite;
        }
        
        .avatar-icon {
          font-size: 16px;
          z-index: 1;
        }
        
        .typing-content {
          flex: 1;
          min-width: 0;
        }
        
        .typing-message {
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .typing-dots {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.1;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
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
      `}</style>
    </div>
  );
};

export default TypingIndicator;
