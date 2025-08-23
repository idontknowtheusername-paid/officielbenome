import React from 'react';
import AIDAProfile from './AIDAProfile';

const MessageBubble = ({ 
  message, 
  isUser = false, 
  showAvatar = true,
  className = "" 
}) => {
  const { role, content } = message;
  const isAssistant = role === 'assistant';

  return (
    <div className={`message-container ${isUser ? 'user-message' : 'assistant-message'} ${className}`}>
      {showAvatar && (
        <div className="message-avatar">
          {isUser ? (
            <div className="user-avatar">
              <span>👤</span>
            </div>
          ) : (
            <AIDAProfile size="default" showStatus={false} />
          )}
        </div>
      )}
      
      <div className="message-bubble">
        <div className="message-content">
          {content}
        </div>
        <div className="message-time">
          {new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      <style jsx>{`
        .message-container {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin: 12px 0;
          animation: slideIn 0.3s ease-out;
        }
        
        .user-message {
          flex-direction: row-reverse;
        }
        
        .message-avatar {
          flex-shrink: 0;
        }
        
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border: 2px solid #2563eb;
        }
        

        
        .message-bubble {
          max-width: 75%;
          position: relative;
        }
        
        .user-message .message-bubble {
          max-width: 75%;
        }
        
        .assistant-message .message-bubble {
          max-width: 85%;
        }
        
        .message-content {
          padding: 12px 16px;
          border-radius: 18px;
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.5;
          font-size: 14px;
          position: relative;
          overflow: hidden;
        }
        
        .user-message .message-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .assistant-message .message-content {
          background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
          color: #e2e8f0;
          border: 1px solid #4a5568;
          border-bottom-left-radius: 4px;
        }
        
        .message-time {
          font-size: 11px;
          color: #a0aec0;
          margin-top: 4px;
          text-align: right;
          opacity: 0.7;
        }
        
        .user-message .message-time {
          text-align: left;
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
        
        /* Responsive */
        @media (max-width: 640px) {
          .message-bubble {
            max-width: 85%;
          }
          
          .user-message .message-bubble {
            max-width: 85%;
          }
          
          .assistant-message .message-bubble {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageBubble;
