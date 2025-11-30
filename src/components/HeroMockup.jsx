import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Composant de mockup visuel pour le Hero Carousel
 * Génère des designs CSS purs (pas d'images externes)
 */
const HeroMockup = ({ gradient, pattern = 'dots', className }) => {
  
  // Patterns SVG pour les fonds
  const getPattern = () => {
    switch (pattern) {
      case 'dots':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        );
      
      case 'grid':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <defs>
              <pattern id="grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        );
      
      case 'diagonal':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-15">
            <defs>
              <pattern id="diagonal" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="30" stroke="currentColor" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonal)" />
          </svg>
        );
      
      case 'waves':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern id="waves" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0 50 Q 25 25, 50 50 T 100 50" fill="none" stroke="currentColor" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#waves)" />
          </svg>
        );
      
      case 'circles':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <defs>
              <pattern id="circles" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circles)" />
          </svg>
        );
      
      case 'mesh':
        return (
          <div className="absolute inset-0 w-full h-full">
            {/* Mesh gradient avec blur */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-2xl"></div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Gradient de base */}
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
      
      {/* Glassmorphisme - Couches de verre */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-white/5 backdrop-blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-white/3 backdrop-blur-2xl rounded-tl-[100px]"></div>
      </div>

      {/* Pattern overlay */}
      <div className="absolute inset-0 text-white">
        {getPattern()}
      </div>
      
      {/* Effet de profondeur avec cercles flous - Glassmorphisme */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl backdrop-blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl backdrop-blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/8 rounded-full blur-2xl backdrop-blur-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Overlay glassmorphisme final */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5 backdrop-blur-sm"></div>
    </div>
  );
};

export default HeroMockup;
