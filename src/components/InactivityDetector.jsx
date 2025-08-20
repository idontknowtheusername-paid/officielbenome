import React from 'react';
import useInactivityDetector from '@/hooks/useInactivityDetector';

const InactivityDetector = () => {
  // Utiliser le hook de détection d'inactivité
  useInactivityDetector();
  
  // Ce composant ne rend rien, il utilise juste le hook
  return null;
};

export default InactivityDetector;
