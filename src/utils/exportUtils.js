// ============================================================================
// UTILITAIRES D'EXPORT DE DONNÉES
// ============================================================================

/**
 * Convertit un objet en ligne CSV
 * @param {Object} obj - Objet à convertir
 * @param {Array} headers - En-têtes des colonnes
 * @returns {string} Ligne CSV formatée
 */
const objectToCSVRow = (obj, headers) => {
  return headers
    .map(header => {
      const value = obj[header.key] || '';
      
      // Formater les valeurs selon leur type
      if (header.type === 'date') {
        return formatDate(value);
      } else if (header.type === 'currency') {
        return formatCurrency(value);
      } else if (header.type === 'boolean') {
        return value ? 'Oui' : 'Non';
      } else if (header.type === 'array') {
        return Array.isArray(value) ? value.join(', ') : value;
      } else if (header.type === 'object') {
        return typeof value === 'object' ? JSON.stringify(value) : value;
      }
      
      return value;
    })
    .map(value => `"${String(value).replace(/"/g, '""')}"`)
    .join(',');
};

/**
 * Formate une date pour l'affichage
 * @param {string|Date} date - Date à formater
 * @returns {string} Date formatée
 */
const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return date;
  }
};

/**
 * Formate une valeur monétaire
 * @param {number} amount - Montant à formater
 * @returns {string} Montant formaté
 */
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '';
  
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    return String(amount);
  }
};

/**
 * Exporte des données en CSV
 * @param {Array} data - Données à exporter
 * @param {Array} headers - Configuration des en-têtes
 * @param {string} filename - Nom du fichier
 */
export const exportToCSV = (data, headers, filename = 'export') => {
  try {
    // Créer l'en-tête CSV
    const csvHeaders = headers.map(h => h.label).join(',');
    
    // Créer les lignes de données
    const csvRows = data.map(item => objectToCSVRow(item, headers));
    
    // Combiner en-tête et données
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    // Créer le blob et télécharger
    const blob = new Blob(['\ufeff' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return { success: true, message: 'Export CSV réussi' };
  } catch (error) {
    console.error('Erreur lors de l\'export CSV:', error);
    throw new Error('Impossible d\'exporter les données');
  }
};

/**
 * Exporte des données en JSON
 * @param {Array} data - Données à exporter
 * @param {string} filename - Nom du fichier
 */
export const exportToJSON = (data, filename = 'export') => {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return { success: true, message: 'Export JSON réussi' };
  } catch (error) {
    console.error('Erreur lors de l\'export JSON:', error);
    throw new Error('Impossible d\'exporter les données');
  }
};

/**
 * Configuration des en-têtes pour l'export des utilisateurs
 */
export const userExportHeaders = [
  { key: 'id', label: 'ID', type: 'string' },
  { key: 'first_name', label: 'Prénom', type: 'string' },
  { key: 'last_name', label: 'Nom', type: 'string' },
  { key: 'email', label: 'Email', type: 'string' },
  { key: 'phone_number', label: 'Téléphone', type: 'string' },
  { key: 'role', label: 'Rôle', type: 'string' },
  { key: 'status', label: 'Statut', type: 'string' },
  { key: 'is_verified', label: 'Vérifié', type: 'boolean' },
  { key: 'created_at', label: 'Date de création', type: 'date' },
  { key: 'last_login_at', label: 'Dernière connexion', type: 'date' }
];

/**
 * Configuration des en-têtes pour l'export des annonces
 */
export const listingExportHeaders = [
  { key: 'id', label: 'ID', type: 'string' },
  { key: 'title', label: 'Titre', type: 'string' },
  { key: 'price', label: 'Prix', type: 'currency' },
  { key: 'category', label: 'Catégorie', type: 'string' },
  { key: 'status', label: 'Statut', type: 'string' },
  { key: 'location', label: 'Localisation', type: 'object' },
  { key: 'views_count', label: 'Vues', type: 'number' },
  { key: 'favorites_count', label: 'Favoris', type: 'number' },
  { key: 'created_at', label: 'Date de création', type: 'date' },
  { key: 'updated_at', label: 'Dernière modification', type: 'date' }
];

/**
 * Configuration des en-têtes pour l'export des transactions
 */
export const transactionExportHeaders = [
  { key: 'id', label: 'ID', type: 'string' },
  { key: 'reference', label: 'Référence', type: 'string' },
  { key: 'type', label: 'Type', type: 'string' },
  { key: 'amount', label: 'Montant', type: 'currency' },
  { key: 'currency', label: 'Devise', type: 'string' },
  { key: 'status', label: 'Statut', type: 'string' },
  { key: 'payment_method', label: 'Méthode de paiement', type: 'string' },
  { key: 'created_at', label: 'Date de création', type: 'date' },
  { key: 'completed_at', label: 'Date de finalisation', type: 'date' }
];

/**
 * Configuration des en-têtes pour l'export des catégories
 */
export const categoryExportHeaders = [
  { key: 'id', label: 'ID', type: 'string' },
  { key: 'name', label: 'Nom', type: 'string' },
  { key: 'slug', label: 'Slug', type: 'string' },
  { key: 'parent_category', label: 'Type parent', type: 'string' },
  { key: 'description', label: 'Description', type: 'string' },
  { key: 'icon', label: 'Icône', type: 'string' },
  { key: 'sort_order', label: 'Ordre de tri', type: 'number' },
  { key: 'is_active', label: 'Actif', type: 'boolean' },
  { key: 'created_at', label: 'Date de création', type: 'date' },
  { key: 'updated_at', label: 'Dernière modification', type: 'date' }
];

/**
 * Configuration des en-têtes pour l'export des rapports
 */
export const reportExportHeaders = [
  { key: 'id', label: 'ID', type: 'string' },
  { key: 'reason', label: 'Raison', type: 'string' },
  { key: 'status', label: 'Statut', type: 'string' },
  { key: 'type', label: 'Type', type: 'string' },
  { key: 'severity', label: 'Sévérité', type: 'string' },
  { key: 'created_at', label: 'Date de création', type: 'date' },
  { key: 'moderated_at', label: 'Date de modération', type: 'date' }
];

/**
 * Export rapide avec configuration prédéfinie
 */
export const quickExport = {
  users: (data, filename = 'utilisateurs') => 
    exportToCSV(data, userExportHeaders, filename),
  
  listings: (data, filename = 'annonces') => 
    exportToCSV(data, listingExportHeaders, filename),
  
  transactions: (data, filename = 'transactions') => 
    exportToCSV(data, transactionExportHeaders, filename),
  
  categories: (data, filename = 'categories') => 
    exportToCSV(data, categoryExportHeaders, filename),
  
  reports: (data, filename = 'rapports') => 
    exportToCSV(data, reportExportHeaders, filename)
};
