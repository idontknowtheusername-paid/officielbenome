import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

const AssistantAvatar = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    default: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`
      relative flex items-center justify-center rounded-full
      bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500
      text-white font-bold shadow-lg
      ${sizeClasses[size]}
      ${className}
    `}>
      {/* Icône principale */}
      <Bot className="w-5 h-5" />
      
      {/* Effet de brillance */}
      <div className="absolute -top-1 -right-1">
        <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
      </div>
      
      {/* Bordure animée */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-spin opacity-20" />
    </div>
  );
};

export default AssistantAvatar;
