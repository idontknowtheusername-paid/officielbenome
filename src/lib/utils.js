import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

export function formatDate(dateString) {
  if (!dateString) return 'Date inconnue';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'À l\'instant';
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (diffInHours < 48) {
    return 'Hier';
  } else if (diffInHours < 168) { // 7 jours
    const days = Math.floor(diffInHours / 24);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
