// Version robuste du système de toast compatible Safari
let toastCount = 0;

// Fonction sécurisée pour créer des toasts
export const toast = function(options) {
  // Vérification de sécurité pour Safari
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { id: 'noop', dismiss: function() {} };
  }
  
  const id = 'toast-' + (++toastCount);
  const container = document.getElementById('toaster-container');
  
  if (!container) {
    console.warn('Toast container not found');
    return { id: 'noop', dismiss: function() {} };
  }
  
  try {
    // Créer l'élément toast de manière sécurisée
    const toastElement = document.createElement('div');
    toastElement.id = id;
    toastElement.className = 'bg-background border rounded-md p-4 shadow-lg max-w-sm mb-2';
    
    // Contenu sécurisé
    let content = '';
    if (options.title) {
      content += '<div class="font-semibold">' + options.title + '</div>';
    }
    if (options.description) {
      content += '<div class="text-sm opacity-90 mt-1">' + options.description + '</div>';
    }
    
    toastElement.innerHTML = content + 
      '<button onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-foreground/50 hover:text-foreground">✕</button>';
    
    // Ajouter au container
    container.appendChild(toastElement);
    
    // Auto-suppression
    if (options.duration !== Infinity) {
      setTimeout(function() {
        if (toastElement.parentNode) {
          toastElement.remove();
        }
      }, options.duration || 5000);
    }

  return {
      id: id,
      dismiss: function() {
        if (toastElement.parentNode) {
          toastElement.remove();
        }
      }
    };
  } catch (error) {
    console.error('Error creating toast:', error);
    return { id: 'error', dismiss: function() {} };
  }
};

// Hook simplifié et robuste
export function useToast() {
  return {
    toast: toast,
    toasts: []
  };
}
