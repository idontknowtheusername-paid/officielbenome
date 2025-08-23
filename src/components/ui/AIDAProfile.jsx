import React from 'react';

const AIDAProfile = ({ 
  size = 'default', 
  showName = false, 
  showStatus = false,
  className = "" 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    default: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={`aida-profile ${className}`}>
      <div className={`profile-container ${sizeClasses[size]}`}>
        {/* Fond principal avec gradient bleu moderne */}
        <div className="profile-background">
          <div className="gradient-overlay"></div>
          <div className="geometric-pattern"></div>
        </div>
        
        {/* Logo AIDA moderne */}
        <div className="aida-logo">
          <div className="logo-circle">
            <span className="logo-text">A</span>
          </div>
          <div className="logo-accent"></div>
        </div>
        
        {/* Indicateur de statut */}
        {showStatus && (
          <div className="status-indicator">
            <div className="status-dot"></div>
          </div>
        )}
        
        {/* Effet de brillance */}
        <div className="shine-effect"></div>
      </div>
      
      {/* Nom et description */}
      {showName && (
        <div className="profile-info">
          <div className={`profile-name ${textSizes[size]}`}>AIDA</div>
          <div className="profile-description">Assistant Intelligent</div>
        </div>
      )}
      
      <style jsx>{`
        .aida-profile {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .profile-container {
          position: relative;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        
        .profile-background {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }
        
        .gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
        }
        
        .geometric-pattern {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 2px, transparent 2px),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 2px, transparent 2px);
          background-size: 100% 100%;
        }
        
        .aida-logo {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .logo-circle {
          width: 60%;
          height: 60%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .logo-text {
          font-weight: 700;
          color: #1d4ed8;
          font-size: 0.8em;
          letter-spacing: -0.5px;
        }
        
        .logo-accent {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0ea5e9;
          border: 2px solid rgba(255, 255, 255, 0.9);
        }
        
        .status-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          z-index: 3;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          border: 2px solid rgba(255, 255, 255, 0.9);
          animation: pulse 2s infinite;
        }
        
        .shine-effect {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shine 3s infinite;
        }
        
        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .profile-name {
          font-weight: 600;
          color: #1f2937;
          line-height: 1;
        }
        
        .profile-description {
          font-size: 0.75em;
          color: #6b7280;
          line-height: 1;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
        }
        
        @keyframes shine {
          0% {
            left: -100%;
          }
          50% {
            left: 100%;
          }
          100% {
            left: 100%;
          }
        }
        
        /* Responsive */
        @media (max-width: 640px) {
          .profile-container {
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
          }
        }
      `}</style>
    </div>
  );
};

export default AIDAProfile;
