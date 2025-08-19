import React, { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Composant d'amélioration de l'accessibilité pour les composants de messagerie
 * Fournit des améliorations ARIA, navigation clavier et support des lecteurs d'écran
 */
const AccessibilityEnhancer = ({ 
  children, 
  role = 'dialog',
  ariaLabel,
  ariaDescription,
  ariaLive = 'polite',
  onEscape,
  onEnter,
  focusOnMount = true,
  trapFocus = true,
  className = '',
  ...props 
}) => {
  const containerRef = useRef(null);
  const { toast } = useToast();

  // Gestion de la navigation au clavier
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
        case 'Enter':
          if (onEnter) {
            event.preventDefault();
            onEnter();
          }
          break;
        case 'Tab':
          if (trapFocus && containerRef.current) {
            const focusableElements = containerRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length === 0) return;
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (event.shiftKey && document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
          break;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      
      // Focus automatique sur le premier élément focusable
      if (focusOnMount) {
        const firstFocusable = container.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          setTimeout(() => firstFocusable.focus(), 100);
        }
      }
    }

    return () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [onEscape, onEnter, focusOnMount, trapFocus]);

  // Annoncer les changements d'état aux lecteurs d'écran
  const announceToScreenReader = (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // Exposer la fonction d'annonce pour les composants enfants
  const enhancedProps = {
    ...props,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescription ? `${ariaDescription}-desc` : undefined,
    'aria-live': ariaLive,
    'role': role,
    'tabIndex': -1,
    ref: containerRef,
    className: `accessibility-enhanced ${className}`.trim(),
    onFocus: (e) => {
      if (props.onFocus) props.onFocus(e);
      announceToScreenReader(`${ariaLabel || 'Interface'} activée`);
    }
  };

  return (
    <div {...enhancedProps}>
      {ariaDescription && (
        <div id={`${ariaDescription}-desc`} className="sr-only">
          {ariaDescription}
        </div>
      )}
      {children}
      
      {/* Instructions d'accessibilité pour les lecteurs d'écran */}
      <div className="sr-only" aria-live="polite">
        <p>Utilisez Tab pour naviguer entre les éléments, Entrée pour activer, et Échap pour fermer.</p>
        {trapFocus && (
          <p>La navigation est limitée à cette interface. Utilisez Tab pour naviguer entre les éléments disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default AccessibilityEnhancer;
