import React, { useState, useEffect } from 'react';
import AIDAProfile from '../AIDAProfile';

const AdvancedThinkingIndicator = ({ 
  steps = [],
  currentStep = 0,
  onStepComplete,
  className = "" 
}) => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStepData, setCurrentStepData] = useState(null);

  useEffect(() => {
    if (currentStep < steps.length) {
      setCurrentStepData(steps[currentStep]);
      
      // Simuler la progression de l'étape
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, currentStep]);
        onStepComplete?.(currentStep);
      }, steps[currentStep].duration || 2000);

      return () => clearTimeout(timer);
    }
  }, [currentStep, steps, onStepComplete]);

  return (
    <div className={`advanced-thinking ${className}`}>
      <div className="thinking-header">
        <AIDAProfile size="default" showStatus={true} />
        <div className="thinking-title">
          <div className="thinking-icon">🧠</div>
          <div className="thinking-text">AIDA analyse intelligemment...</div>
        </div>
      </div>
      
      <div className="thinking-steps">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`thinking-step ${index === currentStep ? 'active' : ''} ${completedSteps.includes(index) ? 'completed' : ''}`}
          >
            <div className="step-indicator">
              {completedSteps.includes(index) ? (
                <div className="step-check">✓</div>
              ) : index === currentStep ? (
                <div className="step-loading">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              ) : (
                <div className="step-number">{index + 1}</div>
              )}
            </div>
            
            <div className="step-content">
              <div className="step-title">{step.title}</div>
              {index === currentStep && step.description && (
                <div className="step-description">{step.description}</div>
              )}
              {index === currentStep && step.progress && (
                <div className="step-progress">
                  <div 
                    className="step-progress-bar"
                    style={{ width: `${step.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .advanced-thinking {
          background: linear-gradient(135deg, #0e141b 0%, #1a1f2e 100%);
          border: 1px solid #2d3748;
          border-radius: 16px;
          padding: 20px;
          margin: 12px 0;
          animation: slideIn 0.4s ease-out;
        }
        
        .thinking-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .thinking-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .thinking-icon {
          font-size: 20px;
          animation: pulse 2s infinite;
        }
        
        .thinking-text {
          color: #e2e8f0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .thinking-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .thinking-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .thinking-step.active {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        
        .thinking-step.completed {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .step-indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .step-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #4a5568;
          color: #a0aec0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }
        
        .step-check {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #10b981;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
        }
        
        .step-loading {
          display: flex;
          gap: 2px;
        }
        
        .loading-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3b82f6;
          animation: loadingDot 1.4s infinite ease-in-out;
        }
        
        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }
        
        .step-content {
          flex: 1;
          min-width: 0;
        }
        
        .step-title {
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .step-description {
          color: #a0aec0;
          font-size: 12px;
          margin-bottom: 8px;
        }
        
        .step-progress {
          height: 4px;
          background: #2d3748;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .step-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 2px;
          transition: width 0.3s ease;
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
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        @keyframes loadingDot {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        /* Responsive */
        @media (max-width: 640px) {
          .advanced-thinking {
            padding: 16px;
          }
          
          .thinking-steps {
            gap: 8px;
          }
          
          .thinking-step {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedThinkingIndicator;
