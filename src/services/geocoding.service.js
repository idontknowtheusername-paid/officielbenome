// Service de géocodage utilisant OpenStreetMap Nominatim
class GeocodingService {
  constructor() {
    this.baseUrl = 'https://nominatim.openstreetmap.org';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Rechercher une adresse
  async searchLocation(query, options = {}) {
    const {
      limit = 5,
      countrycodes = '',
      bounded = 0,
      viewbox = '',
      addressdetails = 1
    } = options;

    // Vérifier le cache
    const cacheKey = `${query}_${limit}_${countrycodes}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: limit.toString(),
        addressdetails: addressdetails.toString(),
        bounded: bounded.toString()
      });

      if (countrycodes) {
        params.append('countrycodes', countrycodes);
      }

      if (viewbox) {
        params.append('viewbox', viewbox);
      }

      const response = await fetch(`${this.baseUrl}/search?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MaxiMarket-LocationPicker/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // Formater les résultats
      const results = data.map(item => ({
        id: item.place_id,
        name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: item.type,
        importance: item.importance,
        address: item.address,
        boundingbox: item.boundingbox
      }));

      // Mettre en cache
      this.setCache(cacheKey, results);
      
      return results;

    } catch (error) {
      console.error('Erreur géocodage:', error);
      throw new Error('Erreur lors de la recherche d\'adresse. Veuillez réessayer.');
    }
  }

  // Géocodage inverse (coordonnées vers adresse)
  async reverseGeocode(lat, lon, options = {}) {
    const {
      zoom = 18,
      addressdetails = 1,
      extratags = 1
    } = options;

    const cacheKey = `reverse_${lat}_${lon}_${zoom}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        format: 'json',
        zoom: zoom.toString(),
        addressdetails: addressdetails.toString(),
        extratags: extratags.toString()
      });

      const response = await fetch(`${this.baseUrl}/reverse?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MaxiMarket-LocationPicker/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      const result = {
        id: data.place_id,
        name: data.display_name,
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lon),
        type: data.type,
        address: data.address,
        boundingbox: data.boundingbox
      };

      // Mettre en cache
      this.setCache(cacheKey, result);
      
      return result;

    } catch (error) {
      console.error('Erreur géocodage inverse:', error);
      throw new Error('Erreur lors de la récupération de l\'adresse. Veuillez réessayer.');
    }
  }

  // Rechercher des lieux populaires
  async searchPopularPlaces(query, options = {}) {
    const {
      limit = 10,
      countrycodes = 'fr,be,ch,ca' // France, Belgique, Suisse, Canada
    } = options;

    try {
      const results = await this.searchLocation(query, { limit, countrycodes });
      
      // Trier par importance
      return results.sort((a, b) => b.importance - a.importance);

    } catch (error) {
      console.error('Erreur recherche lieux populaires:', error);
      return [];
    }
  }

  // Valider des coordonnées
  validateCoordinates(lat, lon) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    
    if (isNaN(latNum) || isNaN(lonNum)) {
      return false;
    }
    
    if (latNum < -90 || latNum > 90) {
      return false;
    }
    
    if (lonNum < -180 || lonNum > 180) {
      return false;
    }
    
    return true;
  }

  // Formater une adresse
  formatAddress(address) {
    if (!address) return '';
    
    const parts = [];
    
    if (address.house_number) parts.push(address.house_number);
    if (address.road) parts.push(address.road);
    if (address.postcode) parts.push(address.postcode);
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }
    if (address.country) parts.push(address.country);
    
    return parts.join(', ');
  }

  // Gestion du cache
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Vider le cache
  clearCache() {
    this.cache.clear();
  }

  // Obtenir les statistiques du cache
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instance singleton
const geocodingService = new GeocodingService();

export default geocodingService;
