import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocationPicker } from './index';

const LocationPickerDemo = () => {
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setLocationHistory(prev => [location, ...prev.slice(0, 4)]); // Garder les 5 dernières
    
    console.log('Localisation sélectionnée:', location);
  };

  const clearHistory = () => {
    setLocationHistory([]);
    setSelectedLocation(null);
  };

  const formatLocationSource = (source) => {
    switch (source) {
      case 'gps': return '📍 GPS';
      case 'search': return '🔍 Recherche';
      case 'map': return '🗺️ Carte';
      default: return '❓ Inconnu';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            🗺️ Démonstration LocationPicker
            <Badge variant="secondary">100% Fonctionnel</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Testez le système de localisation complet avec vraie API OpenStreetMap et carte interactive Leaflet.
          </p>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowLocationPicker(true)}
              className="bg-primary hover:bg-primary/90"
            >
              🗺️ Ouvrir le sélecteur de localisation
            </Button>
            
            <Button
              variant="outline"
              onClick={clearHistory}
              disabled={locationHistory.length === 0}
            >
              🗑️ Effacer l'historique
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Localisation actuellement sélectionnée */}
      {selectedLocation && (
        <Card>
          <CardHeader>
            <CardTitle>📍 Localisation actuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-primary mb-2">Coordonnées</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Latitude :</strong> {selectedLocation.latitude.toFixed(6)}</p>
                    <p><strong>Longitude :</strong> {selectedLocation.longitude.toFixed(6)}</p>
                    {selectedLocation.accuracy && (
                      <p><strong>Précision GPS :</strong> {Math.round(selectedLocation.accuracy)} mètres</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-primary mb-2">Informations</h4>
                  <div className="space-y-1 text-sm">
                    {selectedLocation.name && (
                      <p><strong>Nom :</strong> {selectedLocation.name}</p>
                    )}
                    {selectedLocation.address && (
                      <p><strong>Adresse :</strong> {selectedLocation.address}</p>
                    )}
                    <p><strong>Source :</strong> {formatLocationSource(selectedLocation.source)}</p>
                    <p><strong>Heure :</strong> {new Date(selectedLocation.timestamp).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </div>
              
              {/* Lien vers Google Maps */}
              <div className="pt-3 border-t border-primary/20">
                <a
                  href={`https://www.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <span>🗺️ Voir sur Google Maps</span>
                  <span className="text-xs">(nouvel onglet)</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique des localisations */}
      {locationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📚 Historique des localisations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locationHistory.map((location, index) => (
                <div
                  key={`${location.timestamp}-${index}`}
                  className="border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium">
                      {formatLocationSource(location.source)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(location.timestamp).toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <p className="truncate" title={location.name || 'Sans nom'}>
                      <strong>Nom :</strong> {location.name || 'Sans nom'}
                    </p>
                    <p className="truncate" title={location.address || 'Sans adresse'}>
                      <strong>Adresse :</strong> {location.address || 'Sans adresse'}
                    </p>
                    <p>
                      <strong>Coords :</strong> {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions de test */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Instructions de test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">✅ Fonctionnalités testées</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Géolocalisation GPS en temps réel</li>
                <li>• Recherche d'adresses via OpenStreetMap</li>
                <li>• Carte interactive Leaflet</li>
                <li>• Sélection manuelle sur la carte</li>
                <li>• Géocodage inverse (coords → adresse)</li>
                <li>• Cache intelligent des résultats</li>
                <li>• Gestion des erreurs et permissions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔧 Tests à effectuer</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Autoriser l'accès GPS</li>
                <li>• Rechercher "Paris", "Lyon", etc.</li>
                <li>• Cliquer sur la carte</li>
                <li>• Utiliser le bouton "Ma position"</li>
                <li>• Vérifier le cache et la performance</li>
                <li>• Tester sur mobile</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Composant LocationPicker */}
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        showMap={true}
      />
    </div>
  );
};

export default LocationPickerDemo;
