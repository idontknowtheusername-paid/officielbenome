import React, { useState } from 'react';
import { useI18n } from '@/i18n/hooks';
import { translationService } from '@/services/translation.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const TranslationTest = () => {
  const { t, currentLanguage, changeLanguage, availableLanguages, languageNames, formatCurrency, formatDate } = useI18n();
  const [testText, setTestText] = useState('Bonjour le monde');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  const handleTestTranslation = async () => {
    setIsTranslating(true);
    try {
      const result = await translationService.translateText(testText, 'en', 'fr');
      setTranslatedText(result);
    } catch (error) {
      console.error('Translation test error:', error);
      setTranslatedText('Erreur de traduction');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTestAPI = async () => {
    const status = await translationService.testConnection();
    setApiStatus(status);
  };

  const handleGetCacheStats = () => {
    const stats = translationService.getCacheStats();
    setCacheStats(stats);
  };

  const handleClearCache = () => {
    translationService.clearCache();
    setCacheStats(null);
  };

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
              <div>
                <h4 className="font-medium mb-2">Navigation</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Accueil:</strong> {t('navigation.home')}</p>
                  <p><strong>Marketplace:</strong> {t('navigation.marketplace')}</p>
                  <p><strong>Immobilier:</strong> {t('navigation.immobilier')}</p>
                  <p><strong>Automobile:</strong> {t('navigation.automobile')}</p>
                  <p><strong>Services:</strong> {t('navigation.services')}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Actions</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Créer:</strong> {t('actions.create')}</p>
                  <p><strong>Modifier:</strong> {t('actions.edit')}</p>
                  <p><strong>Supprimer:</strong> {t('actions.delete')}</p>
                  <p><strong>Rechercher:</strong> {t('actions.search')}</p>
                  <p><strong>Découvrir:</strong> {t('actions.discover')}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Test de formatage */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Formatage localisé</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Devises</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>XOF:</strong> {formatCurrency(50000, 'XOF')}</p>
                  <p><strong>EUR:</strong> {formatCurrency(100, 'EUR')}</p>
                  <p><strong>USD:</strong> {formatCurrency(50, 'USD')}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Dates</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Aujourd'hui:</strong> {formatDate(new Date(), 'PP')}</p>
                  <p><strong>Court:</strong> {formatDate(new Date(), 'P')}</p>
                  <p><strong>Distance:</strong> {formatDate(new Date(Date.now() - 86400000))}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Test de traduction automatique */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Traduction automatique</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Texte à traduire"
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button onClick={handleTestTranslation} disabled={isTranslating}>
                  {isTranslating ? 'Traduction...' : 'Traduire'}
                </Button>
              </div>
              {translatedText && (
                <div className="p-3 bg-muted rounded-md">
                  <strong>Résultat:</strong> {translatedText}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Statut de l'API */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Statut de l'API</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleTestAPI} variant="outline">
                  Tester la connexion API
                </Button>
                <Button onClick={handleGetCacheStats} variant="outline">
                  Statistiques du cache
                </Button>
                <Button onClick={handleClearCache} variant="outline">
                  Vider le cache
                </Button>
              </div>
              
              {apiStatus && (
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">Statut API:</h4>
                  <p><strong>Succès:</strong> {apiStatus.success ? '✅' : '❌'}</p>
                  <p><strong>Message:</strong> {apiStatus.message}</p>
                  {apiStatus.test && (
                    <div className="mt-2">
                      <p><strong>Test:</strong> "{apiStatus.test.original}" → "{apiStatus.test.translated}"</p>
                    </div>
                  )}
                  {apiStatus.error && (
                    <p><strong>Erreur:</strong> {apiStatus.error}</p>
                  )}
                </div>
              )}

              {cacheStats && (
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">Statistiques du cache:</h4>
                  <p><strong>Taille:</strong> {cacheStats.size} / {cacheStats.maxSize}</p>
                  <p><strong>Hits:</strong> {cacheStats.hits}</p>
                  <p><strong>Misses:</strong> {cacheStats.misses}</p>
                  <p><strong>Taux de réussite:</strong> {(cacheStats.hitRate * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informations système */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informations système</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                             <div>
                 <p><strong>Langue actuelle:</strong> {currentLanguage}</p>
                 <p><strong>Direction:</strong> LTR (Français et Anglais)</p>
                 <p><strong>Service configuré:</strong> {translationService.isConfigured ? '✅' : '❌'}</p>
               </div>
              <div>
                <p><strong>Langues supportées:</strong> {availableLanguages.join(', ')}</p>
                <p><strong>Mode développement:</strong> {import.meta.env.DEV ? '✅' : '❌'}</p>
                <p><strong>API Key configurée:</strong> {import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY ? '✅' : '❌'}</p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationTest;
