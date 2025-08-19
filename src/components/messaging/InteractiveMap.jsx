import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet-custom.css';

// Fix pour les icônes Leaflet avec Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const InteractiveMap = ({ 
  center = [48.8566, 2.3522], 
  zoom = 13, 
  onLocationSelect,
  selectedLocation = null,
  height = '400px',
  className = ''
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialiser la carte
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Gérer les clics sur la carte
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      // Supprimer l'ancien marqueur
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      // Ajouter un nouveau marqueur
      markerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div class="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map);

      // Notifier le composant parent
      if (onLocationSelect) {
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          timestamp: new Date().toISOString(),
          source: 'map'
        });
      }
    });

    // Marquer la carte comme prête
    map.whenReady(() => {
      setIsMapReady(true);
    });

    // Nettoyer à la fermeture
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, onLocationSelect]);

  // Mettre à jour le marqueur quand la localisation sélectionnée change
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;

    // Supprimer l'ancien marqueur
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    // Ajouter le nouveau marqueur
    markerRef.current = L.marker([selectedLocation.latitude, selectedLocation.longitude], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: '<div class="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    }).addTo(mapInstanceRef.current);

    // Centrer la carte sur la localisation
    mapInstanceRef.current.setView([selectedLocation.latitude, selectedLocation.longitude], 15);
  }, [selectedLocation]);

  // Centrer la carte sur une nouvelle position
  const centerMap = (lat, lng, zoomLevel = 15) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoomLevel);
    }
  };

  // Exposer la fonction de centrage
  useEffect(() => {
    if (window.centerMapOnLocation) {
      window.centerMapOnLocation = centerMap;
    } else {
      window.centerMapOnLocation = centerMap;
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        style={{ height }} 
        className="w-full rounded-lg overflow-hidden border"
      />
      
      {/* Indicateur de chargement */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-sm">
        Cliquez sur la carte pour sélectionner un point
      </div>
    </div>
  );
};

export default InteractiveMap;
