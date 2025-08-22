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
  const diffInMinutes = (now - date) / (1000 * 60);
  const diffInHours = diffInMinutes / 60;
  const diffInDays = diffInHours / 24;
  
  if (diffInMinutes < 1) {
    return 'À l\'instant';
  } else if (diffInMinutes < 60) {
    const minutes = Math.floor(diffInMinutes);
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (diffInDays < 2) {
    return 'Hier';
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
