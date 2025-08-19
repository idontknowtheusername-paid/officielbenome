import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  X, 
  Navigation, 
  Search, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Crosshair,
  Clock,
  Globe,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import InteractiveMap from './InteractiveMap';
import geocodingService from '../../services/geocoding.service';

const LocationPicker = ({ 
  onLocationSelect, 
  onClose, 
  isOpen = false,
  defaultLocation = null,
  showMap = true
}) => {
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  
  const { toast } = useToast();

  // Obtenir la position actuelle via GPS
  const getCurrentPosition = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsLoading(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const { latitude, longitude } = position.coords;
      const location = {
        latitude,
        longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString(),
        source: 'gps'
      };

      setCurrentPosition(location);
      setSelectedLocation(location);
      setHasPermission(true);
      
      toast({
        title: "Position obtenue !",
        description: `Précision : ${Math.round(position.coords.accuracy)} mètres`,
        duration: 3000,
      });

    } catch (err) {
      console.error('Erreur géolocalisation:', err);
      
      if (err.code === 1) {
        setError('Permission de géolocalisation refusée. Veuillez autoriser l\'accès à votre position dans les paramètres de votre navigateur.');
      } else if (err.code === 2) {
        setError('Impossible de déterminer votre position. Vérifiez que votre GPS est activé.');
      } else if (err.code === 3) {
        setError('Délai d\'attente dépassé. Vérifiez votre connexion internet.');
      } else {
        setError('Erreur lors de la géolocalisation. Veuillez réessayer.');
      }
      
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Rechercher une adresse
  const searchLocation = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Utiliser la vraie API de géocodage
      const results = await geocodingService.searchLocation(query, {
        limit: 8,
        countrycodes: 'fr,be,ch,ca', // France, Belgique, Suisse, Canada
        addressdetails: 1
      });
      
      setSearchResults(results);
      
    } catch (err) {
      console.error('Erreur recherche:', err);
      setError(err.message || 'Erreur lors de la recherche. Veuillez réessayer.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Sélectionner un résultat de recherche
  const selectSearchResult = useCallback((result) => {
    const location = {
      latitude: result.latitude,
      longitude: result.longitude,
      name: result.name,
      timestamp: new Date().toISOString(),
      source: 'search'
    };

    setSelectedLocation(location);
    setSearchQuery(result.name);
    setSearchResults([]);
    
    toast({
      title: "Localisation sélectionnée !",
      description: result.name,
      duration: 3000,
    });
  }, [toast]);

  // Sélectionner manuellement sur la carte
  const selectOnMap = useCallback(async (lat, lng) => {
    try {
      // Obtenir l'adresse via géocodage inverse
      const addressData = await geocodingService.reverseGeocode(lat, lng);
      
      const location = {
        latitude: lat,
        longitude: lng,
        name: addressData.name,
        address: geocodingService.formatAddress(addressData.address),
        timestamp: new Date().toISOString(),
        source: 'map'
      };

      setSelectedLocation(location);
      
      toast({
        title: "Position sélectionnée !",
        description: addressData.name || `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
        duration: 3000,
      });
    } catch (error) {
      // Si le géocodage inverse échoue, utiliser juste les coordonnées
      const location = {
        latitude: lat,
        longitude: lng,
        timestamp: new Date().toISOString(),
        source: 'map'
      };

      setSelectedLocation(location);
      
      toast({
        title: "Position sélectionnée !",
        description: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
        duration: 3000,
      });
    }
  }, [toast]);

  // Confirmer la sélection
  const confirmLocation = useCallback(() => {
    if (selectedLocation && onLocationSelect) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  }, [selectedLocation, onLocationSelect, onClose]);

  // Gérer la fermeture
  const handleClose = useCallback(() => {
    setSelectedLocation(null);
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    onClose();
  }, [onClose]);

  // Rechercher quand l'utilisateur tape
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchLocation(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchLocation]);

  // Obtenir la position au chargement si pas de localisation par défaut
  useEffect(() => {
    if (isOpen && !defaultLocation && !currentPosition) {
      getCurrentPosition();
    }
  }, [isOpen, defaultLocation, currentPosition, getCurrentPosition]);

  // Gestion des erreurs de permission
  if (hasPermission === false) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-card border border-border rounded-lg p-6 max-w-md mx-4 text-center"
            >
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Accès à la localisation refusé</h3>
              <p className="text-muted-foreground mb-4">
                {error || 'Pour utiliser la géolocalisation, vous devez autoriser l\'accès à votre position dans les paramètres de votre navigateur.'}
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Fermer
                </Button>
                <Button onClick={getCurrentPosition}>
                  Réessayer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="bg-card border border-border rounded-lg overflow-hidden max-w-4xl w-full mx-4 max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Sélectionner une localisation
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Contenu principal */}
            <div className="p-4 space-y-4">
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Rechercher une adresse, ville, lieu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Résultats de recherche */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {searchResults.map((result) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => selectSearchResult(result)}
                    >
                      <MapPin className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{result.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.type} • {geocodingService.formatAddress(result.address)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

                                {/* Carte interactive réelle */}
                  {showMap && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Carte interactive</h4>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={getCurrentPosition}
                            disabled={isLoading}
                            className="flex items-center"
                          >
                            <Crosshair className="h-4 w-4 mr-2" />
                            Ma position
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (selectedLocation) {
                                // Centrer la carte sur la localisation sélectionnée
                                if (window.centerMapOnLocation) {
                                  window.centerMapOnLocation(
                                    selectedLocation.latitude, 
                                    selectedLocation.longitude
                                  );
                                }
                              }
                            }}
                            disabled={!selectedLocation}
                            className="flex items-center"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Centrer
                          </Button>
                        </div>
                      </div>
                      
                      <InteractiveMap
                        center={currentPosition ? [currentPosition.latitude, currentPosition.longitude] : [48.8566, 2.3522]}
                        zoom={13}
                        onLocationSelect={selectOnMap}
                        selectedLocation={selectedLocation}
                        height="400px"
                        className="w-full"
                      />
                    </div>
                  )}

              {/* Localisation sélectionnée */}
              {selectedLocation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-primary/10 border border-primary/20 rounded-lg p-4"
                >
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-primary mb-2">Localisation sélectionnée</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Latitude :</strong> {selectedLocation.latitude.toFixed(6)}</p>
                        <p><strong>Longitude :</strong> {selectedLocation.longitude.toFixed(6)}</p>
                        {selectedLocation.name && (
                          <p><strong>Nom :</strong> {selectedLocation.name}</p>
                        )}
                        {selectedLocation.address && (
                          <p><strong>Adresse :</strong> {selectedLocation.address}</p>
                        )}
                        {selectedLocation.accuracy && (
                          <p><strong>Précision :</strong> {Math.round(selectedLocation.accuracy)} mètres</p>
                        )}
                        <p><strong>Source :</strong> {selectedLocation.source}</p>
                        <p><strong>Heure :</strong> {new Date(selectedLocation.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Erreurs */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-destructive/10 border border-destructive/20 rounded-lg p-3"
                >
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-destructive mb-2">Erreur</h4>
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer avec actions */}
            <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
              <div className="text-sm text-muted-foreground">
                {selectedLocation ? (
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Localisation prête à être envoyée
                  </span>
                ) : (
                  "Aucune localisation sélectionnée"
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button
                  onClick={confirmLocation}
                  disabled={!selectedLocation}
                  className="bg-primary hover:bg-primary/90"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Utiliser cette localisation
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationPicker;
