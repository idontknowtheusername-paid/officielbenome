import { useState, useCallback, useEffect } from 'react';
import { translationService } from '../services/translation.service';
import { useI18n } from '../i18n/hooks';

export const useAutoTranslation = () => {
  const { currentLanguage } = useI18n();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState(null);
  const [translationError, setTranslationError] = useState(null);
  
  const translateContent = useCallback(async (content, sourceLanguage = 'fr') => {
    // Si la langue cible est la même que la source, pas besoin de traduire
    if (currentLanguage === sourceLanguage) {
      setTranslatedContent(null);
      setTranslationError(null);
      return;
    }
    
    // Si pas de contenu, ne rien faire
    if (!content) {
      setTranslatedContent(null);
      setTranslationError(null);
      return;
    }
    
    try {
      setIsTranslating(true);
      setTranslationError(null);
      
      let translated;
      
      if (typeof content === 'string') {
        translated = await translationService.translateText(
          content, 
          currentLanguage, 
          sourceLanguage
        );
      } else if (typeof content === 'object') {
        translated = await translationService.translateObject(
          content, 
          currentLanguage, 
          sourceLanguage
        );
      } else {
        translated = content;
      }
      
      setTranslatedContent(translated);
    } catch (error) {
      console.error('Auto translation error:', error);
      setTranslationError(error.message || 'Translation failed');
      setTranslatedContent(null);
    } finally {
      setIsTranslating(false);
    }
  }, [currentLanguage]);
  
  const clearTranslation = useCallback(() => {
    setTranslatedContent(null);
    setTranslationError(null);
  }, []);
  
  const retryTranslation = useCallback(async (content, sourceLanguage = 'fr') => {
    await translateContent(content, sourceLanguage);
  }, [translateContent]);
  
  return {
    translateContent,
    isTranslating,
    translatedContent,
    translationError,
    clearTranslation,
    retryTranslation,
    hasTranslation: translatedContent !== null,
  };
};

// Hook spécialisé pour les annonces
export const useListingTranslation = (listing, sourceLanguage = 'fr') => {
  const { translateContent, isTranslating, translatedContent, translationError } = useAutoTranslation();
  
  useEffect(() => {
    if (listing) {
      translateContent(listing, sourceLanguage);
    }
  }, [listing, sourceLanguage, translateContent]);
  
  const displayListing = translatedContent || listing;
  
  return {
    listing: displayListing,
    isTranslating,
    translationError,
    isTranslated: translatedContent !== null,
  };
};

// Hook spécialisé pour les listes d'annonces
export const useListingsTranslation = (listings, sourceLanguage = 'fr') => {
  const { translateContent, isTranslating, translatedContent, translationError } = useAutoTranslation();
  
  useEffect(() => {
    if (listings && Array.isArray(listings)) {
      translateContent(listings, sourceLanguage);
    }
  }, [listings, sourceLanguage, translateContent]);
  
  const displayListings = translatedContent || listings;
  
  return {
    listings: displayListings,
    isTranslating,
    translationError,
    isTranslated: translatedContent !== null,
  };
};
