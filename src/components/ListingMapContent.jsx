import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import { getCityCoordinates, WEST_AFRICA_CENTER } from '@/lib/cityCoordinates';
import 'leaflet/dist/leaflet.css';

// Sous-composant pour gérer l'animation de vol (Zoom fluide)
const FlyToLocation = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 13, {
        duration: 2.5,
        easeLinearity: 0.25
      });
    }
  }, [coords, map]);
  return null;
};

const ListingMapContent = ({ city, country }) => {
  const [coords, setCoords] = useState(null);
  const [isDark, setIsDark] = useState(false);

  // Détection du Dark Mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Résolution des coordonnées
  useEffect(() => {
    const cityCoords = getCityCoordinates(city);
    setCoords(cityCoords);
  }, [city]);

  const center = coords || WEST_AFRICA_CENTER;
  const zoom = coords ? 13 : 5;

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-sm h-[300px] w-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        style={{ background: isDark ? '#1a1a1a' : '#f0f0f0' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={
            isDark 
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
              : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          }
        />

        {coords && (
          <>
            <Circle 
              center={coords}
              pathOptions={{ 
                color: isDark ? '#3b82f6' : '#2563eb',
                fillColor: isDark ? '#3b82f6' : '#2563eb', 
                fillOpacity: 0.2,
                weight: 2
              }}
              radius={1500}
            />
            <FlyToLocation coords={coords} />
          </>
        )}
      </MapContainer>
      
      {/* Badge Flottant */}
      <div className="absolute top-3 right-3 z-[400] bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold shadow-md border border-border/50">
        📍 {city} {country ? `, ${country}` : ''}
      </div>
    </div>
  );
};

export default ListingMapContent;
