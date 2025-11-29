import React, { useEffect } from 'react';

export function Toaster() {
  useEffect(() => {
    // Créer le container de toast s'il n'existe pas
    if (typeof document !== 'undefined') {
      let container = document.getElementById('toaster-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toaster-container';
        // Position: top-right avec meilleur espacement
        container.className = 'fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-md w-full sm:w-auto';
        document.body.appendChild(container);

        // Ajouter les animations CSS
        const style = document.createElement('style');
        style.textContent = `
          @keyframes slide-in-from-right-full {
            from {
              transform: translateX(calc(100% + 1rem));
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slide-out-to-right-full {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(calc(100% + 1rem));
              opacity: 0;
            }
          }
          
          @keyframes toast-progress {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
          
          .animate-in {
            animation: slide-in-from-right-full 0.3s ease-out;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <div
      id="toaster-container"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-md w-full sm:w-auto px-4 sm:px-0"
    >
      {/* Les toasts seront injectés ici dynamiquement */}
    </div>
  );
}
