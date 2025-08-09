// Resolution d'intention basique a partir d'une requete libre

// Principales villes (≥10 par pays): Senegal, Benin, Togo, Cote d'Ivoire, Nigeria
const CITY_LIST = [
  // Senegal
  'Dakar','Thiès','Saint-Louis','Kaolack','Ziguinchor','Touba','Mbour','Rufisque','Pikine','Guédiawaye',
  // Benin
  'Cotonou','Porto-Novo','Abomey-Calavi','Parakou','Djougou','Bohicon','Kandi','Lokossa','Ouidah','Natitingou',
  // Togo
  'Lomé','Sokodé','Kara','Kpalimé','Atakpamé','Bassar','Tsévié','Aného','Dapaong','Mango',
  // Cote d'Ivoire
  'Abidjan','Bouaké','Daloa','Yamoussoukro','San-Pédro','Korhogo','Man','Abengourou','Gagnoa','Anyama',
  // Nigeria
  'Lagos','Kano','Ibadan','Abuja','Port Harcourt','Benin City','Maiduguri','Zaria','Aba','Jos'
];

const AUTO_BRANDS = [
  'toyota','peugeot','renault','citroën','citroen','ford','volkswagen','vw','bmw','mercedes','audi','honda','nissan','hyundai','kia','dacia','opel','fiat','chevrolet','mazda','suzuki'
];

/**
 * Résout l'intention de recherche à partir d'une requête libre
 */
export function resolveSearchIntent(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return { section: 'marketplace', params: { sort: 'popular' } };
  }

  const query = rawQuery.trim();
  const q = query.toLowerCase();
  // Normaliser (enlever accents) pour une detection plus robuste
  const qn = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const qflat = qn.replace(/[\s-]/g, '');

  // Detecter la ville
  const matchesCity = (name) => {
    const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const nflat = n.replace(/[\s-]/g, '');
    return qn.includes(n) || qflat.includes(nflat);
  };
  const city = CITY_LIST.find(c => matchesCity(c));

  // Detecter prix (k/m)
  let minPrice; let maxPrice;
  const priceTokens = q.match(/(\d+[\.,]?\d*)\s*(k|m)?/gi) || [];
  const parsePrice = (t) => {
    const m = t.match(/(\d+[\.,]?\d*)\s*(k|m)?/i);
    if (!m) return null;
    const num = parseFloat(m[1].replace(',', '.'));
    const mult = m[2] ? (m[2].toLowerCase() === 'm' ? 1_000_000 : 1_000) : 1;
    return Math.round(num * mult);
  };
  if (priceTokens.length >= 2 && /entre|et|-/i.test(q)) {
    const p1 = parsePrice(priceTokens[0]);
    const p2 = parsePrice(priceTokens[1]);
    if (p1 && p2) {
      minPrice = Math.min(p1, p2);
      maxPrice = Math.max(p1, p2);
    }
  } else if (/max|<=|<\s*/i.test(q) && priceTokens[0]) {
    maxPrice = parsePrice(priceTokens[0]);
  } else if (/min|>=|>\s*/i.test(q) && priceTokens[0]) {
    minPrice = parsePrice(priceTokens[0]);
  } else if (priceTokens.length === 1) {
    // Un seul prix -> on l'utilise comme maxPrice par defaut
    maxPrice = parsePrice(priceTokens[0]);
  }

  // Detecter categorie
  let section = 'marketplace';
  if (/\b(appartement|maison|terrain|studio|immobilier|villa|pi[eè]ces|m²|m2)\b/i.test(q)) {
    section = 'immobilier';
  } else if (/\b(voiture|auto|car|moto|scooter|camion|camionnette|vehicule|véhicule)\b/i.test(q) || AUTO_BRANDS.some(b => q.includes(b))) {
    section = 'automobile';
  } else if (/\b(plombier|electricien|électricien|menage|ménage|jardinage|coiffure|réparation|reparation|d[eé]m[eé]nagement|cours|prof|service|informatique|evenementiel|événementiel)\b/i.test(q)) {
    section = 'services';
  }

  // Detecter marque/modele (automobile)
  let brand;
  const foundBrand = AUTO_BRANDS.find(b => q.includes(b));
  if (foundBrand) brand = foundBrand;

  const params = { search: query, sort: 'popular' };
  if (city) params.location = city;
  if (minPrice) params.minPrice = String(minPrice);
  if (maxPrice) params.maxPrice = String(maxPrice);
  if (brand && section === 'automobile') params.brand = brand;

  return { section, params };
}

export default resolveSearchIntent;

