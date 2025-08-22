import React, { useEffect } from 'react';
import { useAutoTranslation } from '../hooks/useAutoTranslation';
import { useI18n } from '../i18n/hooks';
import { Loader2, Globe, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

const TranslatedContent = ({ 
  content, 
  sourceLanguage = 'fr',
  children,
  className = '',
  showTranslationIndicator = true,
  showRetryButton = true,
  fallbackToOriginal = true
}) => {
  const { currentLanguage } = useI18n();
  const { 
    translateContent, 
    isTranslating, 
    translatedContent, 
    translationError,
    retryTranslation,
    hasTranslation
  } = useAutoTranslation();
  
  useEffect(() => {
    if (content && currentLanguage !== sourceLanguage) {
      translateContent(content, sourceLanguage);
    }
  }, [content, currentLanguage, sourceLanguage, translateContent]);
  
  const displayContent = translatedContent || content;
  
  // Si on est dans la langue source, afficher directement
  if (currentLanguage === sourceLanguage) {
    return (
      <div className={className}>
        {children(content)}
      </div>
    );
  }
  
  // Pendant la traduction
  if (isTranslating) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
            {currentLanguage === 'fr' ? 'Traduction en cours...' : 'Translating...'}
          </span>
      </div>
    );
  }
  
  // En cas d'erreur de traduction
  if (translationError && !fallbackToOriginal) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center space-x-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
                      <span>
              {currentLanguage === 'fr' ? 'Erreur de traduction' : 'Translation error'}
            </span>
        </div>
        {showRetryButton && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => retryTranslation(content, sourceLanguage)}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-3 w-3" />
            <span>
              {currentLanguage === 'fr' ? 'Réessayer' : 'Retry'}
            </span>
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className={className}>
      {children(displayContent)}
      
      {/* Indicateur de traduction */}
      {showTranslationIndicator && hasTranslation && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
          <Globe className="h-3 w-3" />
          <span>
            {currentLanguage === 'fr' ? 'Traduit automatiquement' : 'Automatically translated'}
          </span>
        </div>
      )}
      
      {/* Message d'erreur avec fallback */}
      {translationError && fallbackToOriginal && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
          <AlertCircle className="h-3 w-3" />
          <span>
            {currentLanguage === 'fr' ? 'Affichage en langue originale' : 'Showing in original language'}
          </span>
        </div>
      )}
    </div>
  );
};

// Composant spécialisé pour les annonces
export const TranslatedListing = ({ listing, children, ...props }) => {
  return (
    <TranslatedContent content={listing} {...props}>
      {(translatedListing) => children(translatedListing)}
    </TranslatedContent>
  );
};

// Composant spécialisé pour les listes d'annonces
export const TranslatedListings = ({ listings, children, ...props }) => {
  return (
    <TranslatedContent content={listings} {...props}>
      {(translatedListings) => children(translatedListings)}
    </TranslatedContent>
  );
};

export default TranslatedContent;
