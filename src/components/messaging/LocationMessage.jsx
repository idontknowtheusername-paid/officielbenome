import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, X, Share2, Clock, Activity, User, ChevronDown, ChevronUp, Maximize2, Minimize2, AlertCircle, Battery, Signal } from 'lucide-react';

// ==================== COMPOSANT PRINCIPAL ====================
const LocationMessage = ({ 
  initialLocation = null,
  isLiveTracking = false,
  sender = null,
  timestamp = new Date(),
  onClose = null,
  mode = 'view' // 'view' | 'share' | 'live'
}) => {
  const [location, setLocation] = useState(initialLocation);
  const [isTracking, setIsTracking] = useState(isLiveTracking);
  const [trackingDuration, setTrackingDuration] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [heading, setHeading] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [battery, setBattery] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const watchIdRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const trackingStartRef = useRef(null);

  // ==================== INITIALISATION CARTE ====================
  useEffect(() => {
    if (!mapContainerRef.current || mapLoaded) return;

    // Créer la carte Leaflet
    const L = window.L;
    if (!L) {
      console.error('Leaflet non chargé');
      return;
    }

    const defaultLat = initialLocation?.lat || 6.3703;
    const defaultLng = initialLocation?.lng || 2.3912;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // Tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Ajouter contrôles de zoom personnalisés
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Marqueur personnalisé
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg)">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    const marker = L.marker([defaultLat, defaultLng], { icon: customIcon }).addTo(map);
    
    // Cercle de précision
    const accuracyCircle = L.circle([defaultLat, defaultLng], {
      radius: 50,
      color: '#667eea',
      fillColor: '#667eea',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '5, 5'
    }).addTo(map);

    mapInstanceRef.current = map;
    markerRef.current = { marker, accuracyCircle };
    setMapLoaded(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded, initialLocation]);

  // ==================== SUIVI GPS EN TEMPS RÉEL ====================
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      return;
    }

    trackingStartRef.current = Date.now();
    setIsTracking(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const successCallback = (position) => {
      const { latitude, longitude, accuracy: acc, speed: spd, heading: hdg } = position.coords;
      
      const newLocation = {
        lat: latitude,
        lng: longitude,
        accuracy: acc,
        speed: spd,
        heading: hdg,
        timestamp: new Date(position.timestamp)
      };

      setLocation(newLocation);
      setAccuracy(acc);
      setSpeed(spd);
      setHeading(hdg);
      setLastUpdate(new Date());

      // Mettre à jour la carte
      if (mapInstanceRef.current && markerRef.current) {
        const { marker, accuracyCircle } = markerRef.current;
        marker.setLatLng([latitude, longitude]);
        accuracyCircle.setLatLng([latitude, longitude]);
        accuracyCircle.setRadius(acc);
        mapInstanceRef.current.panTo([latitude, longitude], { animate: true });
      }
    };

    const errorCallback = (err) => {
      console.error('Erreur GPS:', err);
      if (err.code === 1) {
        setError('Permission refusée. Autorisez la géolocalisation.');
      } else if (err.code === 2) {
        setError('Position indisponible. Vérifiez votre GPS.');
      } else {
        setError('Délai dépassé. Réessayez.');
      }
      stopTracking();
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      options
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    trackingStartRef.current = null;
  }, []);

  // ==================== DURÉE DE SUIVI ====================
  useEffect(() => {
    if (!isTracking || !trackingStartRef.current) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - trackingStartRef.current) / 1000);
      setTrackingDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking]);

  // ==================== BATTERIE ====================
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        setBattery(Math.floor(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBattery(Math.floor(battery.level * 100));
        });
      });
    }
  }, []);

  // ==================== NETTOYAGE ====================
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  // ==================== UTILITAIRES ====================
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getAccuracyColor = (acc) => {
    if (!acc) return 'text-gray-400';
    if (acc < 10) return 'text-green-500';
    if (acc < 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSpeedKmh = (speedMps) => {
    if (!speedMps) return 0;
    return (speedMps * 3.6).toFixed(1);
  };

  // ==================== RENDU ====================
  return (
    <div className={`flex flex-col bg-gray-900 text-white rounded-2xl overflow-hidden shadow-2xl ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'max-w-md mx-auto'
    }`}>
      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {sender && (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User size={20} />
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg">
              {isTracking ? 'Position en direct' : 'Position partagée'}
            </h3>
            {sender && <p className="text-sm text-white/80">{sender.name}</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* ==================== STATUT EN DIRECT ==================== */}
      {isTracking && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="animate-pulse" />
            <span className="text-sm font-medium">Suivi en direct</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              {formatDuration(trackingDuration)}
            </div>
            {battery !== null && (
              <div className="flex items-center gap-1">
                <Battery size={14} />
                {battery}%
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== CARTE ==================== */}
      <div className={`relative bg-gray-800 ${
        isFullscreen ? 'flex-1' : isExpanded ? 'h-96' : 'h-64'
      }`}>
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Bouton centrer */}
        <button
          onClick={() => {
            if (location && mapInstanceRef.current) {
              mapInstanceRef.current.setView([location.lat, location.lng], 15, {
                animate: true
              });
            }
          }}
          className="absolute top-4 right-4 bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          <Navigation size={20} />
        </button>

        {/* Indicateur de précision */}
        {accuracy && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2">
            <Signal size={16} className={getAccuracyColor(accuracy)} />
            <span className="text-sm">±{Math.round(accuracy)}m</span>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* ==================== INFORMATIONS ==================== */}
      <div className="bg-gray-800 p-4 space-y-3">
        {/* Coordonnées */}
        {location && (
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-purple-400 mt-1" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Coordonnées GPS</p>
                <p className="text-xs text-gray-400">
                  {Number(location.lat).toFixed(6)}, {Number(location.lng).toFixed(6)}
                </p>
                {lastUpdate && (
                  <p className="text-xs text-gray-500">
                    Mis à jour il y a {Math.round((Date.now() - lastUpdate) / 1000)}s
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vitesse et cap */}
        {isTracking && (speed !== null || heading !== null) && (
          <div className="grid grid-cols-2 gap-3">
            {speed !== null && (
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Vitesse</p>
                <p className="text-2xl font-bold">{getSpeedKmh(speed)}</p>
                <p className="text-xs text-gray-500">km/h</p>
              </div>
            )}
            {heading !== null && (
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Direction</p>
                <div className="flex items-center gap-2">
                  <Navigation 
                    size={24} 
                    style={{ transform: `rotate(${heading}deg)` }}
                    className="text-purple-400"
                  />
                  <p className="text-xl font-bold">{Math.round(heading)}°</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {mode === 'share' && !isTracking && (
            <button
              onClick={startTracking}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Activity size={20} />
              Partager position en direct
            </button>
          )}
          
          {isTracking && (
            <button
              onClick={stopTracking}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <X size={20} />
              Arrêter le partage
            </button>
          )}

          <button
            onClick={() => {
              if (location) {
                const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
                window.open(url, '_blank');
              }
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition"
          >
            <Share2 size={20} />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition"
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
      </div>

      {/* Timestamp */}
      <div className="bg-gray-900 px-4 py-2 text-center text-xs text-gray-500">
        {timestamp && `Envoyé ${new Date(timestamp).toLocaleString('fr-FR')}`}
      </div>
    </div>
  );
};

// ==================== EXPORT ====================
export default LocationMessage;

// ==================== DEMO APP (pour tests) ====================
export function LocationMessageDemo() {
  const [showLocationMessage, setShowLocationMessage] = useState(false);
  const [demoMode, setDemoMode] = useState('share');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4">
      {/* Charger Leaflet CSS */}
      <link 
        rel="stylesheet" 
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📍 LocationMessage Component
          </h1>
          <p className="text-gray-300">
            Carte interactive + GPS temps réel comme WhatsApp
          </p>
        </div>

        {/* Contrôles Demo */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">🎮 Démo Interactive</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <button
              onClick={() => {
                setDemoMode('view');
                setShowLocationMessage(true);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition"
            >
              👁️ Mode Visualisation
            </button>
            
            <button
              onClick={() => {
                setDemoMode('share');
                setShowLocationMessage(true);
              }}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition"
            >
              📤 Mode Partage
            </button>
            
            <button
              onClick={() => {
                setDemoMode('live');
                setShowLocationMessage(true);
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition"
            >
              🔴 Mode Live Tracking
            </button>
          </div>

          {showLocationMessage && (
            <LocationMessage
              initialLocation={{
                lat: 6.3703,
                lng: 2.3912
              }}
              isLiveTracking={demoMode === 'live'}
              sender={demoMode === 'view' ? { name: 'John Doe', avatar: null } : null}
              timestamp={new Date()}
              onClose={() => setShowLocationMessage(false)}
              mode={demoMode}
            />
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-3xl mb-3">🗺️</div>
            <h3 className="text-lg font-bold text-white mb-2">Carte Interactive</h3>
            <p className="text-gray-300 text-sm">
              OpenStreetMap avec marqueurs personnalisés et cercle de précision
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-3xl mb-3">📡</div>
            <h3 className="text-lg font-bold text-white mb-2">GPS Temps Réel</h3>
            <p className="text-gray-300 text-sm">
              Suivi continu avec watchPosition, précision et vitesse
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-white mb-2">Performance</h3>
            <p className="text-gray-300 text-sm">
              Optimisé avec refs, useCallback et memoization
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-lg font-bold text-white mb-2">Design Moderne</h3>
            <p className="text-gray-300 text-sm">
              UI 2025 avec glassmorphism et animations fluides
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-3xl mb-3">🔋</div>
            <h3 className="text-lg font-bold text-white mb-2">Infos Système</h3>
            <p className="text-gray-300 text-sm">
              Batterie, signal GPS, vitesse et direction
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-lg font-bold text-white mb-2">Mobile Ready</h3>
            <p className="text-gray-300 text-sm">
              Responsive design et mode plein écran
            </p>
          </div>
        </div>

        {/* Guide d'intégration */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mt-6">
          <h2 className="text-2xl font-bold text-white mb-4">📚 Guide d'Intégration</h2>
          
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">1. Installation</h3>
              <code className="block bg-black/30 p-3 rounded-lg text-sm">
                npm install leaflet react
              </code>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">2. Utilisation Simple</h3>
              <pre className="bg-black/30 p-3 rounded-lg text-sm overflow-x-auto">
{`<LocationMessage
  mode="share"
  onLocationUpdate={(loc) => {
    // Envoyer au serveur
    socket.emit('location:update', loc);
  }}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">3. Props Disponibles</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code>initialLocation</code> - Position initiale (lat, lng)</li>
                <li><code>isLiveTracking</code> - Activer le suivi automatique</li>
                <li><code>sender</code> - Info expéditeur (name, avatar)</li>
                <li><code>mode</code> - 'view' | 'share' | 'live'</li>
                <li><code>onClose</code> - Callback fermeture</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">4. WebSocket Backend</h3>
              <pre className="bg-black/30 p-3 rounded-lg text-sm overflow-x-auto">
{`// Socket.io côté serveur
io.on('connection', (socket) => {
  socket.on('location:update', (data) => {
    // Broadcaster aux autres users
    socket.broadcast.emit('location:received', {
      userId: socket.id,
      ...data
    });
  });
});`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}