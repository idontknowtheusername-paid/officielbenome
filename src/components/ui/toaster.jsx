import React, { useEffect } from 'react';

export function Toaster() {
  useEffect(() => {
    // Créer le container de toast s'il n'existe pas
    if (typeof document !== 'undefined') {
      let container = document.getElementById('toaster-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toaster-container';
        container.className = 'fixed top-0 right-0 z-[100] p-4 space-y-2 pointer-events-none';
        document.body.appendChild(container);
      }
    }
  }, []);

  return (
    <div id="toaster-container" className="fixed top-0 right-0 z-[100] p-4 space-y-2 pointer-events-none">
      {/* Les toasts seront injectés ici dynamiquement */}
    </div>
  );
}
