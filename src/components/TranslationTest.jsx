import React from 'react';
import { useI18n } from '@/i18n/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const TranslationTest = () => {
  const { 
    t, 
    currentLanguage, 
    changeLanguage, 
    availableLanguages, 
    languageNames,
    formatCurrency,
    formatDate,
    ready 
  } = useI18n('listings');

  const testKeys = [
    'popularListings',
    'viewAll',
    'viewAllPremium',
    'create.title',
    'form.title',
    'details.title'
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🌍 Test d'Internationalisation - MaxiMarket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Sélecteur de langue */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Langue actuelle</h3>
            <div className="flex flex-wrap gap-2">
              {availableLanguages.map((lang) => (
                <Button
                  key={lang}
                  variant={currentLanguage === lang ? "default" : "outline"}
                  size="sm"
                  onClick={() => changeLanguage(lang)}
                >
                  {languageNames[lang]}
                  {currentLanguage === lang && <Badge className="ml-2">Actuel</Badge>}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Test de traduction statique */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Traduction statique</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testKeys.map((key) => (
                <div key={key} className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Clé: {key}</div>
                  <div className="font-medium">
                    {t(key) || <span className="text-red-500">Clé manquante</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Test de formatage */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Formatage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Devise</div>
                <div className="font-medium">
                  {formatCurrency(150000, 'XOF')}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Date</div>
                <div className="font-medium">
                  {formatDate(new Date(), 'P')}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informations de debug */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informations de debug</h3>
                         <div className="p-3 bg-muted rounded-lg">
               <div className="text-sm">
                 <div><strong>Langue actuelle:</strong> {currentLanguage}</div>
                 <div><strong>Langues disponibles:</strong> {availableLanguages.join(', ')}</div>
                 <div><strong>Namespace:</strong> listings</div>
                 <div><strong>i18n ready:</strong> {ready ? 'Oui' : 'Non'}</div>
                 <div><strong>i18n initialized:</strong> {window.i18next?.isInitialized ? 'Oui' : 'Non'}</div>
                 <div><strong>Current language:</strong> {window.i18next?.language}</div>
                 <div><strong>Namespaces loaded:</strong> {window.i18next?.options?.ns?.join(', ')}</div>
               </div>
             </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationTest;
