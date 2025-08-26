import React from 'react';
import { useI18n } from '../i18n/hooks';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';

const LanguageSelector = ({ className = '', variant = 'dropdown' }) => {
  const { currentLanguage, changeLanguage, availableLanguages, languageNames } = useI18n();
  
  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
  };

  // Version pour le menu mobile (boutons pleine largeur)
  if (variant === 'mobile') {
    return (
      <div className={`space-y-2 ${className}`}>
        {availableLanguages.map((lang) => (
          <Button
            key={lang}
            variant={currentLanguage === lang ? "default" : "outline"}
            size="sm"
            onClick={() => handleLanguageChange(lang)}
            className="w-full justify-start"
          >
            <Globe className="h-4 w-4 mr-2" />
            {languageNames[lang]}
            {currentLanguage === lang && <Check className="h-4 w-4 ml-auto text-primary" />}
          </Button>
        ))}
      </div>
    );
  }
  
  // Version dropdown par défaut
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`flex items-center space-x-2 ${className}`}>
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languageNames[currentLanguage]}</span>
          <span className="sm:hidden">{currentLanguage.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`flex items-center justify-between cursor-pointer ${
              currentLanguage === lang ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {languageNames[lang]}
              </span>
              {/* Pas de RTL pour FR et EN */}
            </div>
            {currentLanguage === lang && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
