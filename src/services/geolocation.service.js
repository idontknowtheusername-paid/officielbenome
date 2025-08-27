import React from 'react';
import { Geolocation } from '@capacitor/geolocation';

export const getCurrentLocation = async () => {
  try {
    console.log('📍 Getting current location...');
    
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });
    
    const location = {
      latitude: coordinates.coords.latitude,
      longitude: coordinates.coords.longitude,
      accuracy: coordinates.coords.accuracy,
      timestamp: coordinates.timestamp
    };
    
    console.log('✅ Location obtained:', location);
    return location;
  } catch (error) {
    console.error('❌ Geolocation error:', error);
    throw error;
  }
};

export const watchLocation = (callback) => {
  try {
    console.log('👀 Starting location watch...');
    
    const watchId = Geolocation.watchPosition({
      enableHighAccuracy: true,
      timeout: 10000
    }, (position) => {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
      
      console.log('📍 Location updated:', location);
      callback(location);
    });
    
    console.log('✅ Location watch started with ID:', watchId);
    return watchId;
  } catch (error) {
    console.error('❌ Error starting location watch:', error);
    throw error;
  }
};

export const stopLocationWatch = async (watchId) => {
  try {
    console.log('🛑 Stopping location watch...');
    
    await Geolocation.clearWatch({ id: watchId });
    console.log('✅ Location watch stopped');
  } catch (error) {
    console.error('❌ Error stopping location watch:', error);
    throw error;
  }
};

export const requestLocationPermissions = async () => {
  try {
    console.log('🔐 Requesting location permissions...');
    
    const permission = await Geolocation.checkPermissions();
    console.log('📍 Current permission status:', permission.location);
    
    if (permission.location === 'granted') {
      console.log('✅ Location permission already granted');
      return true;
    }
    
    if (permission.location === 'denied') {
      console.log('❌ Location permission denied');
      return false;
    }
    
    // Demander la permission
    const requestResult = await Geolocation.requestPermissions();
    console.log('📍 Permission request result:', requestResult.location);
    
    return requestResult.location === 'granted';
  } catch (error) {
    console.error('❌ Error requesting location permissions:', error);
    return false;
  }
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  try {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance en km
    
    return distance;
  } catch (error) {
    console.error('❌ Error calculating distance:', error);
    return null;
  }
};

export const formatDistance = (distance) => {
  if (distance === null) return 'Distance inconnue';
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
};

// Fonction utilitaire pour obtenir l'adresse à partir des coordonnées
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    console.log('🏠 Getting address from coordinates...');
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    
    const data = await response.json();
    const address = data.display_name;
    
    console.log('✅ Address obtained:', address);
    return address;
  } catch (error) {
    console.error('❌ Error getting address:', error);
    return null;
  }
};

// Hook personnalisé pour la géolocalisation
export const useGeolocation = () => {
  const [location, setLocation] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [watchId, setWatchId] = React.useState(null);

  const getLocation = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }
      
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startWatching = React.useCallback(() => {
    if (watchId) return;
    
    try {
      const id = watchLocation((newLocation) => {
        setLocation(newLocation);
      });
      setWatchId(id);
    } catch (err) {
      setError(err.message);
    }
  }, [watchId]);

  const stopWatching = React.useCallback(async () => {
    if (watchId) {
      try {
        await stopLocationWatch(watchId);
        setWatchId(null);
      } catch (err) {
        setError(err.message);
      }
    }
  }, [watchId]);

  React.useEffect(() => {
    return () => {
      if (watchId) {
        stopLocationWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    isLoading,
    error,
    getLocation,
    startWatching,
    stopWatching,
    isWatching: !!watchId
  };
};
