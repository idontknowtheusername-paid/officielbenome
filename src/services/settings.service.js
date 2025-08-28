import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================================
// SERVICE PARAMÈTRES SYSTÈME
// ============================================================================

export const settingsService = {
  // Recuperer tous les parametres systeme
  getSystemSettings: async () => {
    try {
      // Si Supabase n'est pas configure, retourner des parametres par defaut
      if (!isSupabaseConfigured) {
        return {
          general: {
            siteName: 'MaxiMarket',
            siteDescription: 'Marketplace en ligne pour l\'Afrique de l\'Ouest',
            contactEmail: 'contact@maxiimarket.com',
            supportPhone: '+221 77 123 4567',
            timezone: 'Africa/Dakar',
            currency: 'XOF',
            language: 'fr'
          },
          appearance: {
            theme: 'auto',
            primaryColor: '#3B82F6',
            logoUrl: '',
            faviconUrl: '/favicon.ico',
            enableAnimations: true,
            enableGradients: true
          },
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            adminAlerts: true,
            userWelcome: true,
            listingApproval: true,
            transactionUpdates: true
          },
          security: {
            requireEmailVerification: true,
            requirePhoneVerification: false,
            twoFactorAuth: false,
            sessionTimeout: 24,
            maxLoginAttempts: 5,
            passwordMinLength: 8,
            enableCaptcha: true
          },
          system: {
            maintenanceMode: false,
            debugMode: false,
            enableLogs: true,
            backupFrequency: 'daily',
            maxFileSize: 10,
            allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
            enableCaching: true,
            cacheTTL: 3600
          }
        };
      }

      // Recuperer les parametres depuis la base de donnees
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (error) {
        // Si la table n'existe pas, retourner les parametres par defaut
        console.warn('Table system_settings non trouvée, utilisation des paramètres par défaut');
        return settingsService.getDefaultSettings();
      }

      return data.settings || settingsService.getDefaultSettings();
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      return settingsService.getDefaultSettings();
    }
  },

  // Mettre a jour les parametres systeme
  updateSystemSettings: async (newSettings) => {
    try {
      if (!isSupabaseConfigured) {
        // En mode developpement, simuler la sauvegarde
        console.log('Paramètres mis à jour (mode développement):', newSettings);
        return { success: true, message: 'Paramètres mis à jour en mode développement' };
      }

      // Mettre a jour ou creer les parametres dans la base de donnees
      const { data, error } = await supabase
        .from('system_settings')
        .upsert([{
          id: 'main',
          settings: newSettings,
          updated_at: new Date().toISOString()
        }], { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data, message: 'Paramètres mis à jour avec succès' };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw new Error('Impossible de sauvegarder les paramètres');
    }
  },

  // Recuperer un parametre specifique
  getSetting: async (section, key) => {
    try {
      const allSettings = await settingsService.getSystemSettings();
      return allSettings[section]?.[key];
    } catch (error) {
      console.error('Erreur lors de la récupération du paramètre:', error);
      return null;
    }
  },

  // Mettre a jour un parametre specifique
  updateSetting: async (section, key, value) => {
    try {
      const currentSettings = await settingsService.getSystemSettings();
      
      // Mettre a jour le parametre specifique
      if (!currentSettings[section]) {
        currentSettings[section] = {};
      }
      currentSettings[section][key] = value;

      // Sauvegarder tous les parametres
      return await settingsService.updateSystemSettings(currentSettings);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paramètre:', error);
      throw error;
    }
  },

  // Recuperer les parametres par section
  getSettingsBySection: async (section) => {
    try {
      const allSettings = await settingsService.getSystemSettings();
      return allSettings[section] || {};
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres de la section:', error);
      return {};
    }
  },

  // Recuperer les parametres generaux du site
  getSiteSettings: async () => {
    try {
      const allSettings = await settingsService.getSystemSettings();
      return allSettings.general || {};
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres du site:', error);
      return {};
    }
  },

  // Recuperer les parametres d'apparence
  getAppearanceSettings: async () => {
    try {
      const allSettings = await settingsService.getSystemSettings();
      return allSettings.appearance || {};
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres d\'apparence:', error);
      return {};
    }
  },

  // Recuperer les parametres de notifications
  getNotificationSettings: async () => {
    try {
      const allSettings = await settingsService.getSystemSettings();
      return allSettings.notifications || {};
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres de notifications:', error);
      return {};
    }
  },

  // Recuperer les parametres de securite
  getSecuritySettings: async () => {
    try {
      const allSettings = await settingsService.getSystemSettings();
      return allSettings.security || {};
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres de sécurité:', error);
      return {};
    }
  },

  // Recuperer les parametres systeme
  getSystemSettingsSection: async () => {
    try {
      const allSettings = await settingsService.getSystemSettings();
      return allSettings.system || {};
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres système:', error);
      return {};
    }
  },

  // Reinitialiser les parametres aux valeurs par defaut
  resetToDefaults: async () => {
    try {
      const defaultSettings = settingsService.getDefaultSettings();
      return await settingsService.updateSystemSettings(defaultSettings);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des paramètres:', error);
      throw error;
    }
  },

  // Exporter les parametres
  exportSettings: async () => {
    try {
      const settings = await settingsService.getSystemSettings();
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `maximarket-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      return { success: true, message: 'Paramètres exportés avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'export des paramètres:', error);
      throw new Error('Impossible d\'exporter les paramètres');
    }
  },

  // Importer les parametres
  importSettings: async (file) => {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const settings = JSON.parse(e.target.result);
            
            // Valider la structure des parametres
            if (!settingsService.validateSettings(settings)) {
              reject(new Error('Format de paramètres invalide'));
              return;
            }

            // Sauvegarder les parametres importes
            const result = await settingsService.updateSystemSettings(settings);
            resolve(result);
          } catch (error) {
            reject(new Error('Fichier JSON invalide'));
          }
        };

        reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
        reader.readAsText(file);
      });
    } catch (error) {
      console.error('Erreur lors de l\'import des paramètres:', error);
      throw error;
    }
  },

  // Valider la structure des parametres
  validateSettings: (settings) => {
    const requiredSections = ['general', 'appearance', 'notifications', 'security', 'system'];
    
    // Verifier que toutes les sections requises sont presentes
    for (const section of requiredSections) {
      if (!settings[section] || typeof settings[section] !== 'object') {
        return false;
      }
    }

    // Verifier les parametres generaux requis
    const general = settings.general;
    if (!general.siteName || !general.contactEmail || !general.timezone || !general.currency) {
      return false;
    }

    return true;
  },

  // Obtenir les parametres par defaut
  getDefaultSettings: () => {
    return {
      general: {
        siteName: 'MaxiMarket',
        siteDescription: 'Marketplace en ligne pour l\'Afrique de l\'Ouest',
        contactEmail: 'contact@maxiimarket.com',
        supportPhone: '+221 77 123 4567',
        timezone: 'Africa/Dakar',
        currency: 'XOF',
        language: 'fr'
      },
      appearance: {
        theme: 'auto',
        primaryColor: '#3B82F6',
        logoUrl: '',
        faviconUrl: '/favicon.ico',
        enableAnimations: true,
        enableGradients: true
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        adminAlerts: true,
        userWelcome: true,
        listingApproval: true,
        transactionUpdates: true
      },
      security: {
        requireEmailVerification: true,
        requirePhoneVerification: false,
        twoFactorAuth: false,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        enableCaptcha: true
      },
      system: {
        maintenanceMode: false,
        debugMode: false,
        enableLogs: true,
        backupFrequency: 'daily',
        maxFileSize: 10,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
        enableCaching: true,
        cacheTTL: 3600
      }
    };
  }
};
