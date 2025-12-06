import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import { getCityCoordinates, WEST_AFRICA_CENTER } from '@/lib/cityCoordinates';
import 'leaflet/dist/leaflet.css';

// Sous-composant pour gérer l'animation de vol
const FlyToLocation = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      // MODIFICATION ICI : On passe de 13 à 119 pour voir les alentours
      map.flyTo(coords, 11, {
        duration: 2.5,
        easeLinearity: 0.25
      });
    }
  }, [coords, map]);
  return null;
};

const ListingMap = ({ city, country }) => {
  const [coords, setCoords] = useState(null);
  const [isDark, setIsDark] = useState(false);

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

  useEffect(() => {
    setCoords(getCityCoordinates(city));
  }, [city]);

  if (!city) return null;

  const center = coords || WEST_AFRICA_CENTER;
  
  // MODIFICATION ICI AUSSI : Zoom initial plus large (10.5 au lieu de 13)
  const zoom = coords ? 10.5 : 5;

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
          attribution='&copy; CARTO'
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
              // J'ai aussi agrandi le cercle pour qu'il soit visible avec le dézoom
              radius={5000} // 4km de rayon (couvre bien une ville moyenne)
            />
            <FlyToLocation coords={coords} />
          </>
        )}
      </MapContainer>
      
      <div className="absolute top-3 right-3 z-[400] bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold shadow-md border border-border/50">
        📍 {city} {country ? `, ${country}` : ''}
      </div>
    </div>
  );
};

export default ListingMap;