import { z } from 'zod';

// ============================================================================
// SCHÉMAS DE VALIDATION ZOD POUR L'ADMINISTRATION
// ============================================================================

/**
 * Schéma de validation pour la création/modification d'utilisateur
 */
export const userSchema = z.object({
  first_name: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  
  last_name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  
  email: z.string()
    .email('Format d\'email invalide')
    .min(5, 'L\'email doit contenir au moins 5 caractères')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères'),
  
  phone_number: z.string()
    .regex(/^(\+221|221)?[0-9]{9}$/, 'Format de téléphone invalide (ex: +221 77 123 4567)')
    .optional()
    .nullable(),
  
  role: z.enum(['user', 'vendor', 'admin', 'moderator'], {
    errorMap: () => ({ message: 'Rôle invalide' })
  }),
  
  status: z.enum(['active', 'inactive', 'suspended', 'pending'], {
    errorMap: () => ({ message: 'Statut invalide' })
  }),
  
  is_verified: z.boolean().optional(),
  
  profile_image: z.string().url('URL d\'image invalide').optional().nullable()
});

/**
 * Schéma de validation pour la création/modification d'annonce
 */
export const listingSchema = z.object({
  title: z.string()
    .min(10, 'Le titre doit contenir au moins 10 caractères')
    .max(255, 'Le titre ne peut pas dépasser 255 caractères'),
  
  description: z.string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères'),
  
  price: z.number()
    .min(0, 'Le prix ne peut pas être négatif')
    .max(1000000000, 'Le prix ne peut pas dépasser 1 milliard'),
  
  category: z.enum(['real_estate', 'automobile', 'services', 'marketplace'], {
    errorMap: () => ({ message: 'Catégorie invalide' })
  }),
  
  subcategory: z.string()
    .min(2, 'La sous-catégorie doit contenir au moins 2 caractères')
    .max(100, 'La sous-catégorie ne peut pas dépasser 100 caractères')
    .optional(),
  
  status: z.enum(['pending', 'approved', 'rejected', 'expired'], {
    errorMap: () => ({ message: 'Statut invalide' })
  }),
  
  images: z.array(z.string().url('URL d\'image invalide'))
    .min(1, 'Au moins une image est requise')
    .max(10, 'Maximum 10 images autorisées'),
  
  location: z.object({
    city: z.string().min(2, 'Ville requise'),
    country: z.string().min(2, 'Pays requis'),
    address: z.string().optional(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional()
    }).optional()
  }),
  
  contact_info: z.object({
    phone: z.string().regex(/^(\+221|221)?[0-9]{9}$/, 'Format de téléphone invalide'),
    email: z.string().email('Format d\'email invalide'),
    website: z.string().url('URL invalide').optional()
  }),
  
  // Détails spécifiques par catégorie
  real_estate_details: z.object({
    type: z.enum(['appartement', 'maison', 'terrain', 'bureau', 'commerce']),
    rooms: z.string().min(1, 'Nombre de pièces requis'),
    surface: z.string().min(1, 'Surface requise'),
    amenities: z.array(z.string()).optional()
  }).optional(),
  
  automobile_details: z.object({
    brand: z.string().min(2, 'Marque requise'),
    model: z.string().min(2, 'Modèle requis'),
    year: z.number().min(1900).max(new Date().getFullYear() + 1, 'Année invalide'),
    mileage: z.number().min(0, 'Kilométrage invalide').optional(),
    transmission: z.enum(['manuelle', 'automatique']).optional(),
    fuel: z.enum(['essence', 'diesel', 'électrique', 'hybride']).optional()
  }).optional(),
  
  service_details: z.object({
    expertise: z.string().min(2, 'Expertise requise'),
    experience: z.string().min(2, 'Expérience requise'),
    availability: z.string().min(2, 'Disponibilité requise'),
    verified: z.boolean().optional(),
    certifications: z.array(z.string()).optional()
  }).optional(),
  
  product_details: z.object({
    brand: z.string().min(2, 'Marque requise'),
    model: z.string().min(2, 'Modèle requis'),
    condition: z.enum(['neuf', 'excellent', 'bon', 'moyen', 'usé']),
    warranty: z.string().optional(),
    dimensions: z.string().optional(),
    weight: z.string().optional()
  }).optional()
});

/**
 * Schéma de validation pour la création/modification de catégorie
 */
export const categorySchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .regex(/^[a-zA-ZÀ-ÿ0-9\s'-]+$/, 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et apostrophes'),
  
  slug: z.string()
    .min(2, 'Le slug doit contenir au moins 2 caractères')
    .max(100, 'Le slug ne peut pas dépasser 100 caractères')
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
  
  parent_category: z.enum(['real_estate', 'automobile', 'services', 'marketplace'], {
    errorMap: () => ({ message: 'Type parent invalide' })
  }),
  
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
  
  icon: z.string()
    .min(1, 'L\'icône est requise')
    .max(50, 'L\'icône ne peut pas dépasser 50 caractères')
    .optional(),
  
  sort_order: z.number()
    .int('L\'ordre de tri doit être un nombre entier')
    .min(0, 'L\'ordre de tri ne peut pas être négatif')
    .max(999, 'L\'ordre de tri ne peut pas dépasser 999')
    .optional(),
  
  is_active: z.boolean().optional()
});

/**
 * Schéma de validation pour la création/modification de transaction
 */
export const transactionSchema = z.object({
  reference: z.string()
    .min(5, 'La référence doit contenir au moins 5 caractères')
    .max(50, 'La référence ne peut pas dépasser 50 caractères')
    .regex(/^[A-Z0-9-]+$/, 'La référence ne peut contenir que des lettres majuscules, chiffres et tirets'),
  
  type: z.enum(['purchase', 'rental', 'service', 'transfer'], {
    errorMap: () => ({ message: 'Type de transaction invalide' })
  }),
  
  amount: z.number()
    .positive('Le montant doit être positif')
    .max(1000000000, 'Le montant ne peut pas dépasser 1 milliard'),
  
  currency: z.enum(['XOF', 'EUR', 'USD'], {
    errorMap: () => ({ message: 'Devise invalide' })
  }),
  
  status: z.enum(['pending', 'completed', 'cancelled', 'failed'], {
    errorMap: () => ({ message: 'Statut invalide' })
  }),
  
  payment_method: z.enum(['mobile_money', 'bank_transfer', 'cash', 'card'], {
    errorMap: () => ({ message: 'Méthode de paiement invalide' })
  }).optional(),
  
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
  
  expires_at: z.date().optional(),
  
  metadata: z.record(z.any()).optional()
});

/**
 * Schéma de validation pour la création/modification de rapport
 */
export const reportSchema = z.object({
  reason: z.string()
    .min(10, 'La raison doit contenir au moins 10 caractères')
    .max(200, 'La raison ne peut pas dépasser 200 caractères'),
  
  description: z.string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional(),
  
  type: z.enum(['listing', 'comment', 'user', 'review'], {
    errorMap: () => ({ message: 'Type de rapport invalide' })
  }),
  
  severity: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Sévérité invalide' })
  }),
  
  status: z.enum(['pending', 'investigating', 'resolved', 'dismissed'], {
    errorMap: () => ({ message: 'Statut invalide' })
  }),
  
  moderator_notes: z.string()
    .max(500, 'Les notes ne peuvent pas dépasser 500 caractères')
    .optional()
});

/**
 * Schéma de validation pour les paramètres système
 */
export const systemSettingsSchema = z.object({
  general: z.object({
    siteName: z.string().min(2, 'Nom du site requis'),
    siteDescription: z.string().min(10, 'Description du site requise'),
    contactEmail: z.string().email('Email de contact invalide'),
    supportPhone: z.string().regex(/^(\+221|221)?[0-9]{9}$/, 'Format de téléphone invalide'),
    timezone: z.string().min(1, 'Fuseau horaire requis'),
    currency: z.enum(['XOF', 'EUR', 'USD'], { errorMap: () => ({ message: 'Devise invalide' }) }),
    language: z.enum(['fr', 'en'], { errorMap: () => ({ message: 'Langue invalide' }) })
  }),
  
  appearance: z.object({
    theme: z.enum(['light', 'dark', 'auto'], { errorMap: () => ({ message: 'Thème invalide' }) }),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hexadécimale invalide'),
    logoUrl: z.string().url('URL du logo invalide').optional(),
    faviconUrl: z.string().url('URL du favicon invalide').optional(),
    enableAnimations: z.boolean(),
    enableGradients: z.boolean()
  }),
  
  notifications: z.object({
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    adminAlerts: z.boolean(),
    userWelcome: z.boolean(),
    listingApproval: z.boolean(),
    transactionUpdates: z.boolean()
  }),
  
  security: z.object({
    requireEmailVerification: z.boolean(),
    requirePhoneVerification: z.boolean(),
    twoFactorAuth: z.boolean(),
    sessionTimeout: z.number().min(1).max(168),
    maxLoginAttempts: z.number().min(3).max(10),
    passwordMinLength: z.number().min(6).max(20),
    enableCaptcha: z.boolean()
  }),
  
  system: z.object({
    maintenanceMode: z.boolean(),
    debugMode: z.boolean(),
    enableLogs: z.boolean(),
    backupFrequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
    maxFileSize: z.number().min(1).max(100),
    allowedFileTypes: z.array(z.string()),
    enableCaching: z.boolean(),
    cacheTTL: z.number().min(60).max(86400)
  })
});

/**
 * Schéma de validation pour la recherche et filtres
 */
export const searchFiltersSchema = z.object({
  searchTerm: z.string().max(100, 'Terme de recherche trop long').optional(),
  status: z.enum(['all', 'active', 'inactive', 'pending', 'approved', 'rejected']).optional(),
  category: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).max(100).optional()
});

/**
 * Validation avec gestion d'erreurs personnalisée
 */
export const validateWithCustomErrors = (schema, data) => {
  try {
    return {
      success: true,
      data: schema.parse(data),
      errors: null
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.reduce((acc, err) => {
        const field = err.path.join('.');
        acc[field] = err.message;
        return acc;
      }, {});
      
      return {
        success: false,
        data: null,
        errors: formattedErrors
      };
    }
    
    return {
      success: false,
      data: null,
      errors: { general: 'Erreur de validation inconnue' }
    };
  }
};

/**
 * Validation partielle (pour les mises à jour)
 */
export const validatePartial = (schema, data) => {
  try {
    return {
      success: true,
      data: schema.partial().parse(data),
      errors: null
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.reduce((acc, err) => {
        const field = err.path.join('.');
        acc[field] = err.message;
        return acc;
      }, {});
      
      return {
        success: false,
        data: null,
        errors: formattedErrors
      };
    }
    
    return {
      success: false,
      data: null,
      errors: { general: 'Erreur de validation inconnue' }
    };
  }
};
