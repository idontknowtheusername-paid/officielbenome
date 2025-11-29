// Système de toast professionnel avec animations et durées adaptées
let toastCount = 0;

// Durées par type de notification
const TOAST_DURATIONS = {
  success: 3000,    // 3s pour succès
  error: 5000,      // 5s pour erreurs
  warning: 4000,    // 4s pour avertissements
  info: 3000,       // 3s pour infos
  default: 4000     // 4s par défaut
};

// Icônes et couleurs par type
const TOAST_STYLES = {
  success: {
    icon: '✓',
    bgClass: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    iconClass: 'bg-green-500 text-white',
    textClass: 'text-green-900 dark:text-green-100'
  },
  error: {
    icon: '✕',
    bgClass: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
    iconClass: 'bg-red-500 text-white',
    textClass: 'text-red-900 dark:text-red-100'
  },
  warning: {
    icon: '⚠',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
    iconClass: 'bg-yellow-500 text-white',
    textClass: 'text-yellow-900 dark:text-yellow-100'
  },
  info: {
    icon: 'ℹ',
    bgClass: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    iconClass: 'bg-blue-500 text-white',
    textClass: 'text-blue-900 dark:text-blue-100'
  },
  default: {
    icon: '•',
    bgClass: 'bg-background border-border',
    iconClass: 'bg-primary text-primary-foreground',
    textClass: 'text-foreground'
  }
};

// Fonction pour créer des toasts professionnels
export const toast = function(options) {
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
    // Déterminer le type (success, error, warning, info, default)
    let type = 'default';
    if (options.variant === 'destructive') type = 'error';
    else if (options.variant === 'success') type = 'success';
    else if (options.variant === 'warning') type = 'warning';
    else if (options.variant === 'info') type = 'info';
    
    const style = TOAST_STYLES[type];
    const duration = options.duration || TOAST_DURATIONS[type];
    
    // Créer l'élément toast
    const toastElement = document.createElement('div');
    toastElement.id = id;
    toastElement.className = `
      pointer-events-auto
      ${style.bgClass}
      border rounded-lg shadow-lg
      p-4 pr-12
      max-w-md w-full
      transform transition-all duration-300 ease-out
      animate-in slide-in-from-right-full
      hover:scale-105
      relative
    `.trim().replace(/\s+/g, ' ');
    
    // Contenu avec icône
    let content = `
      <div class="flex items-start gap-3">
        <div class="${style.iconClass} rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
          ${style.icon}
        </div>
        <div class="flex-1 ${style.textClass}">
    `;
    
    if (options.title) {
      content += `<div class="font-semibold text-sm mb-1">${options.title}</div>`;
    }
    if (options.description) {
      content += `<div class="text-sm opacity-90">${options.description}</div>`;
    }
    
    content += `
        </div>
      </div>
      <button 
        onclick="this.parentElement.style.animation='slide-out-to-right-full 0.2s ease-in';setTimeout(()=>this.parentElement.remove(),200)" 
        class="absolute top-3 right-3 text-current opacity-50 hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5"
        aria-label="Fermer"
      >
        ✕
      </button>
    `;
    
    toastElement.innerHTML = content;
    
    // Ajouter au container
    container.appendChild(toastElement);
    
    // Barre de progression
    if (duration !== Infinity) {
      const progressBar = document.createElement('div');
      progressBar.className = 'absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg';
      progressBar.style.width = '100%';
      progressBar.style.animation = `toast-progress ${duration}ms linear`;
      toastElement.appendChild(progressBar);
      
      // Auto-suppression avec animation
      setTimeout(function() {
        if (toastElement.parentNode) {
          toastElement.style.animation = 'slide-out-to-right-full 0.2s ease-in';
          setTimeout(() => toastElement.remove(), 200);
        }
      }, duration);
    }

    return {
      id: id,
      dismiss: function() {
        if (toastElement.parentNode) {
          toastElement.style.animation = 'slide-out-to-right-full 0.2s ease-in';
          setTimeout(() => toastElement.remove(), 200);
        }
      }
    };
  } catch (error) {
    console.error('Error creating toast:', error);
    return { id: 'error', dismiss: function() {} };
  }
};

// Hook simplifié
export function useToast() {
  return {
    toast: toast,
    toasts: []
  };
}
