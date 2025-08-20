import { supabase } from '../lib/supabase';

class PreferencesService {
  // Recuperer les preferences d'un utilisateur
  async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Retourner les preferences par defaut si aucune n'existe
      return data || this.getDefaultPreferences(userId);
    } catch (error) {
      console.error('Erreur récupération préférences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  // Creer ou mettre a jour les preferences
  async updateUserPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert([{
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur mise à jour préférences:', error);
      throw error;
    }
  }

  // Preferences par defaut
  getDefaultPreferences(userId) {
    return {
      user_id: userId,
      theme: 'light',
      language: 'fr',
      currency: 'XOF',
      timezone: 'Africa/Abidjan',
      date_format: 'DD/MM/YYYY',
      time_format: '24h',
      
      // Notifications
      email_notifications: {
        new_messages: true,
        listing_updates: true,
        transaction_updates: true,
        marketing: false,
        weekly_digest: true
      },
      
      push_notifications: {
        new_messages: true,
        listing_updates: true,
        transaction_updates: true,
        marketing: false
      },
      
      // Affichage
      display_preferences: {
        listings_per_page: 12,
        show_prices: true,
        show_location: true,
        show_contact_info: true,
        compact_view: false
      },
      
      // Confidentialite
      privacy_settings: {
        profile_visibility: 'public',
        show_online_status: true,
        allow_messages: true,
        show_last_seen: true
      },
      
      // Securite
      security_settings: {
        two_factor_auth: false,
        login_notifications: true,
        session_timeout: 30, // minutes
        require_password_change: false,
        remember_me_enabled: true, // Option "Se souvenir de moi"
        auto_logout: true, // Déconnexion automatique après inactivité
        max_session_age: 7 // jours maximum pour "Se souvenir"
      },
      
      // Personnalisation
      customization: {
        primary_color: '#3B82F6',
        accent_color: '#10B981',
        font_size: 'medium',
        animations_enabled: true
      }
    };
  }

  // Mettre a jour le theme
  async updateTheme(userId, theme) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          theme,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur mise à jour thème:', error);
      throw error;
    }
  }

  // Mettre a jour les preferences de notification
  async updateNotificationPreferences(userId, notificationType, settings) {
    try {
      const currentPrefs = await this.getUserPreferences(userId);
      const updatedPrefs = {
        ...currentPrefs,
        [notificationType]: {
          ...currentPrefs[notificationType],
          ...settings
        },
        updated_at: new Date().toISOString()
      };

      return await this.updateUserPreferences(userId, updatedPrefs);
    } catch (error) {
      console.error('Erreur mise à jour notifications:', error);
      throw error;
    }
  }

  // Mettre a jour les preferences d'affichage
  async updateDisplayPreferences(userId, displaySettings) {
    try {
      const currentPrefs = await this.getUserPreferences(userId);
      const updatedPrefs = {
        ...currentPrefs,
        display_preferences: {
          ...currentPrefs.display_preferences,
          ...displaySettings
        },
        updated_at: new Date().toISOString()
      };

      return await this.updateUserPreferences(userId, updatedPrefs);
    } catch (error) {
      console.error('Erreur mise à jour affichage:', error);
      throw error;
    }
  }

  // Mettre a jour les parametres de confidentialite
  async updatePrivacySettings(userId, privacySettings) {
    try {
      const currentPrefs = await this.getUserPreferences(userId);
      const updatedPrefs = {
        ...currentPrefs,
        privacy_settings: {
          ...currentPrefs.privacy_settings,
          ...privacySettings
        },
        updated_at: new Date().toISOString()
      };

      return await this.updateUserPreferences(userId, updatedPrefs);
    } catch (error) {
      console.error('Erreur mise à jour confidentialité:', error);
      throw error;
    }
  }

  // Mettre a jour les parametres de securite
  async updateSecuritySettings(userId, securitySettings) {
    try {
      const currentPrefs = await this.getUserPreferences(userId);
      const updatedPrefs = {
        ...currentPrefs,
        security_settings: {
          ...currentPrefs.security_settings,
          ...securitySettings
        },
        updated_at: new Date().toISOString()
      };

      return await this.updateUserPreferences(userId, updatedPrefs);
    } catch (error) {
      console.error('Erreur mise à jour sécurité:', error);
      throw error;
    }
  }

  // Mettre a jour la personnalisation
  async updateCustomization(userId, customizationSettings) {
    try {
      const currentPrefs = await this.getUserPreferences(userId);
      const updatedPrefs = {
        ...currentPrefs,
        customization: {
          ...currentPrefs.customization,
          ...customizationSettings
        },
        updated_at: new Date().toISOString()
      };

      return await this.updateUserPreferences(userId, updatedPrefs);
    } catch (error) {
      console.error('Erreur mise à jour personnalisation:', error);
      throw error;
    }
  }

  // Reinitialiser les preferences
  async resetPreferences(userId) {
    try {
      const defaultPrefs = this.getDefaultPreferences(userId);
      return await this.updateUserPreferences(userId, defaultPrefs);
    } catch (error) {
      console.error('Erreur réinitialisation préférences:', error);
      throw error;
    }
  }

  // Exporter les preferences
  async exportPreferences(userId) {
    try {
      const prefs = await this.getUserPreferences(userId);
      
      const exportData = {
        'Thème': prefs.theme,
        'Langue': prefs.language,
        'Devise': prefs.currency,
        'Fuseau horaire': prefs.timezone,
        'Format de date': prefs.date_format,
        'Format d\'heure': prefs.time_format,
        'Notifications email': JSON.stringify(prefs.email_notifications, null, 2),
        'Notifications push': JSON.stringify(prefs.push_notifications, null, 2),
        'Préférences d\'affichage': JSON.stringify(prefs.display_preferences, null, 2),
        'Paramètres de confidentialité': JSON.stringify(prefs.privacy_settings, null, 2),
        'Paramètres de sécurité': JSON.stringify(prefs.security_settings, null, 2),
        'Personnalisation': JSON.stringify(prefs.customization, null, 2)
      };

      return exportData;
    } catch (error) {
      console.error('Erreur export préférences:', error);
      throw error;
    }
  }

  // Verifier si une notification est activee
  async isNotificationEnabled(userId, notificationType, channel = 'email') {
    try {
      const prefs = await this.getUserPreferences(userId);
      const notifications = prefs[`${channel}_notifications`];
      return notifications && notifications[notificationType] === true;
    } catch (error) {
      console.error('Erreur vérification notification:', error);
      return false;
    }
  }

  // Obtenir les preferences de theme
  async getThemePreferences(userId) {
    try {
      const prefs = await this.getUserPreferences(userId);
      return {
        theme: prefs.theme,
        primaryColor: prefs.customization?.primary_color || '#3B82F6',
        accentColor: prefs.customization?.accent_color || '#10B981',
        fontSize: prefs.customization?.font_size || 'medium',
        animationsEnabled: prefs.customization?.animations_enabled !== false
      };
    } catch (error) {
      console.error('Erreur récupération thème:', error);
      return {
        theme: 'light',
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        fontSize: 'medium',
        animationsEnabled: true
      };
    }
  }
}

export const preferencesService = new PreferencesService(); 