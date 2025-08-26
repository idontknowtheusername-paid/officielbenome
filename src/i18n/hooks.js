import { useTranslation } from 'react-i18next';
import { useCallback, useMemo } from 'react';

export const useI18n = (namespace = 'common') => {
  const { t, i18n, ready } = useTranslation(namespace, {
    useSuspense: false,
  });
  
  const changeLanguage = useCallback((lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    
    // Mettre à jour la direction du document pour RTL
    if (lng === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lng;
    }
  }, [i18n]);
  
  const currentLanguage = i18n.language;
  const availableLanguages = ['fr', 'en'];
  
  const languageNames = useMemo(() => ({
    fr: 'Français',
    en: 'English'
  }), []);
  
  const isRTL = false; // Seulement LTR pour FR et EN
  
  const formatCurrency = useCallback((amount, currency = 'XOF') => {
    const currencyMap = {
      fr: { XOF: 'XOF', EUR: 'EUR' },
      en: { XOF: 'XOF', EUR: 'EUR', USD: 'USD' },
    };
    
    const currencyCode = currencyMap[currentLanguage]?.[currency] || currency;
    
    return new Intl.NumberFormat(currentLanguage, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, [currentLanguage]);
  
  const formatDate = useCallback((date, formatStr = 'PP') => {
    const locales = {
      fr: 'fr-FR',
      en: 'en-US',
    };
    
    const locale = locales[currentLanguage] || 'fr-FR';
    
    if (formatStr === 'PP') {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(date));
    }
    
    if (formatStr === 'P') {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(date));
    }
    
    return new Intl.DateTimeFormat(locale).format(new Date(date));
  }, [currentLanguage]);
  
  const formatDistanceToNow = useCallback((date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now - targetDate) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };
    
    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        const translations = {
          fr: {
            year: interval === 1 ? 'an' : 'ans',
            month: 'mois',
            week: interval === 1 ? 'semaine' : 'semaines',
            day: interval === 1 ? 'jour' : 'jours',
            hour: interval === 1 ? 'heure' : 'heures',
            minute: interval === 1 ? 'minute' : 'minutes',
          },
          en: {
            year: interval === 1 ? 'year' : 'years',
            month: interval === 1 ? 'month' : 'months',
            week: interval === 1 ? 'week' : 'weeks',
            day: interval === 1 ? 'day' : 'days',
            hour: interval === 1 ? 'hour' : 'hours',
            minute: interval === 1 ? 'minute' : 'minutes',
          },
        };
        
        const unitTranslation = translations[currentLanguage]?.[unit] || unit;
        const agoTranslation = {
          fr: 'il y a',
          en: 'ago',
        }[currentLanguage] || '';
        
        // Format standard pour FR et EN
        return `${interval} ${unitTranslation} ${agoTranslation}`;
        
        return `${interval} ${unitTranslation} ${agoTranslation}`;
      }
    }
    
    return {
      fr: 'À l\'instant',
      en: 'Just now',
    }[currentLanguage] || 'Just now';
  }, [currentLanguage]);
  
  return {
    t,
    changeLanguage,
    currentLanguage,
    availableLanguages,
    languageNames,
    isRTL,
    formatCurrency,
    formatDate,
    formatDistanceToNow,
    ready,
  };
};
