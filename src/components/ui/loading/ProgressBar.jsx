import React, { useState, useEffect } from 'react';

const ProgressBar = ({ 
  duration = 3000, 
  message = "AIDA traite votre demande...",
  onComplete,
  className = "" 
}) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        setIsComplete(true);
        clearInterval(interval);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className={`progress-container ${className}`}>
      <div className="progress-header">
        <div className="progress-icon">⚡</div>
        <div className="progress-message">{message}</div>
      </div>
      
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        ></div>
        <div className="progress-glow"></div>
      </div>
      
      <div className="progress-percentage">
        {Math.round(progress)}%
      </div>
      
      <style jsx>{`
        .progress-container {
          background: linear-gradient(135deg, #0e141b 0%, #1a1f2e 100%);
          border: 1px solid #2d3748;
          border-radius: 12px;
          padding: 16px;
          margin: 12px 0;
          animation: slideIn 0.3s ease-out;
        }
        
        .progress-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .progress-icon {
          font-size: 18px;
          animation: pulse 2s infinite;
        }
        
        .progress-message {
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 500;
        }
        
        .progress-bar-container {
          position: relative;
          height: 6px;
          background: #2d3748;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          border-radius: 3px;
          transition: width 0.1s ease-out;
          position: relative;
        }
        
        .progress-glow {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 20px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
          animation: shimmer 2s infinite;
        }
        
        .progress-percentage {
          text-align: right;
          color: #a0aec0;
          font-size: 12px;
          font-weight: 600;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
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

export default ProgressBar;
