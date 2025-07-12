import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Fonction pour formater les dates
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Fonction pour formater les nombres
export function formatNumber(num) {
  return new Intl.NumberFormat('fr-FR').format(num);
}

// Fonction pour formater les prix
export function formatPrice(price, currency = 'FCFA') {
  return `${formatNumber(price)} ${currency}`;
}

// Fonction pour tronquer le texte
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Fonction pour générer un ID unique
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Fonction pour valider l'email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Fonction pour valider le numéro de téléphone
export function isValidPhone(phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

// Fonction pour obtenir l'initiale d'un nom
export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Fonction pour calculer le temps écoulé
export function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'À l\'instant';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Il y a ${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Il y a ${diffInDays}j`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `Il y a ${diffInWeeks} sem`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `Il y a ${diffInMonths} mois`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `Il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
}

// Fonction pour obtenir la couleur selon le statut
export function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case 'active':
    case 'success':
    case 'approved':
      return 'green';
    case 'pending':
    case 'warning':
      return 'yellow';
    case 'inactive':
    case 'error':
    case 'rejected':
      return 'red';
    case 'draft':
    case 'info':
      return 'gray';
    default:
      return 'blue';
  }
}

// Fonction pour obtenir l'icône selon la catégorie
export function getCategoryIcon(category) {
  switch (category.toLowerCase()) {
    case 'immobilier':
      return '🏠';
    case 'automobile':
      return '🚗';
    case 'services':
      return '🔧';
    case 'marketplace':
      return '🛍️';
    case 'emploi':
      return '💼';
    case 'formation':
      return '📚';
    default:
      return '📦';
  }
}

// Fonction pour formater la taille des fichiers
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Fonction pour valider les mots de passe
export function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: {
      length: password.length < minLength,
      uppercase: !hasUpperCase,
      lowercase: !hasLowerCase,
      numbers: !hasNumbers,
      special: !hasSpecialChar
    }
  };
}

// Fonction pour copier dans le presse-papiers
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    return false;
  }
}

// Fonction pour télécharger un fichier
export function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Fonction pour générer un gradient CSS
export function generateGradient(color1, color2, direction = 'to right') {
  return `linear-gradient(${direction}, ${color1}, ${color2})`;
}

// Fonction pour obtenir une couleur aléatoire
export function getRandomColor() {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Fonction pour débouncer
export function debounce(func, wait) {
  let timeout;
  
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Fonction pour throttler
export function throttle(func, limit) {
  let inThrottle;
  
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
