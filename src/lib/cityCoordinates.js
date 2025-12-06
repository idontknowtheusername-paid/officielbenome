// Coordonnées (Latitude, Longitude) pour les villes d'Afrique de l'Ouest
// Format : [lat, lng]

export const WEST_AFRICA_CENTER = [9.0820, 8.6753]; // Centre approximatif

export const CITY_COORDINATES = {
  // --- BÉNIN ---
  'cotonou': [6.3654, 2.4183],
  'porto-novo': [6.4969, 2.6289],
  'parakou': [9.3377, 2.6183],
  'abomey-calavi': [6.4485, 2.3556],
  'natitingou': [10.3042, 1.3796],
  'bohicon': [7.1783, 2.0667],
  'ouidah': [6.3631, 2.0851],

  // --- SÉNÉGAL ---
  'dakar': [14.6937, -17.4441],
  'thiès': [14.7910, -16.9259],
  'saint-louis': [16.0326, -16.4818],
  'touba': [14.8665, -15.8833],

  // --- CÔTE D'IVOIRE ---
  'abidjan': [5.3600, -4.0083],
  'yamoussoukro': [6.8276, -5.2893],
  'bouaké': [7.6938, -5.0303],

  // --- TOGO ---
  'lomé': [6.1375, 1.2125],
  'kara': [9.5499, 1.1861],
  'kpalimé': [6.9066, 0.6314],

  // --- AUTRES ---
  'accra': [5.6037, -0.1870],
  'lagos': [6.5244, 3.3792],
  'bamako': [12.6392, -8.0029],
  'ouagadougou': [12.3714, -1.5197],
  'niamey': [13.5116, 2.1254]
};

// Fonction utilitaire pour récupérer les coords de manière insensible à la casse
export const getCityCoordinates = (cityName) => {
  if (!cityName) return null;
  const normalizedCity = cityName.toLowerCase().trim();
  return CITY_COORDINATES[normalizedCity] || null;
};