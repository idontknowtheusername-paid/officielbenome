import { supabase } from '@/lib/supabase';
import { emailService } from './email.service.js';

// ============================================================================
// SERVICE NEWSLETTER
// ============================================================================

export const newsletterService = {
  // S'inscrire à la newsletter
  subscribe: async (email) => {
    try {
      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Adresse email invalide');
      }

      // Vérifier si l'email existe déjà
      const { data: existing, error: checkError } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, is_active')
        .eq('email', email.toLowerCase())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        if (existing.is_active) {
          throw new Error('Cette adresse email est déjà inscrite à la newsletter');
        } else {
          // Réactiver l'inscription
          const { error: updateError } = await supabase
            .from('newsletter_subscribers')
            .update({ 
              is_active: true, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', existing.id);

          if (updateError) throw updateError;
          
          // Envoyer l'email de réactivation
          try {
            await emailService.sendReactivationEmail(email.toLowerCase());
            console.log('✅ Email de réactivation envoyé à:', email);
          } catch (emailError) {
            console.warn('⚠️ Erreur envoi email de réactivation:', emailError);
          }
          
          return {
            success: true,
            message: 'Inscription réactivée avec succès ! Email de confirmation envoyé.',
            action: 'reactivated'
          };
        }
      }

      // Créer une nouvelle inscription
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([{
          email: email.toLowerCase(),
          is_active: true,
          subscribed_at: new Date().toISOString(),
          source: 'footer'
        }])
        .select()
        .single();

      if (error) throw error;

      // Envoyer l'email de bienvenue
      try {
        await emailService.sendWelcomeEmail(email.toLowerCase());
        console.log('✅ Email de bienvenue envoyé à:', email);
      } catch (emailError) {
        console.warn('⚠️ Erreur envoi email de bienvenue:', emailError);
        // Ne pas faire échouer l'inscription si l'email échoue
      }

      return {
        success: true,
        message: 'Inscription à la newsletter réussie ! Email de bienvenue envoyé.',
        action: 'subscribed',
        data
      };

    } catch (error) {
      console.error('Erreur inscription newsletter:', error);
      throw error;
    }
  },

  // Se désinscrire de la newsletter
  unsubscribe: async (email) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ 
          is_active: false, 
          unsubscribed_at: new Date().toISOString() 
        })
        .eq('email', email.toLowerCase());

      if (error) throw error;

      return {
        success: true,
        message: 'Désinscription réussie'
      };

    } catch (error) {
      console.error('Erreur désinscription newsletter:', error);
      throw error;
    }
  },

  // Vérifier le statut d'inscription
  checkStatus: async (email) => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, is_active, subscribed_at')
        .eq('email', email.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return {
        isSubscribed: data?.is_active || false,
        subscribedAt: data?.subscribed_at,
        data
      };

    } catch (error) {
      console.error('Erreur vérification statut newsletter:', error);
      throw error;
    }
  },

  // Obtenir les statistiques (admin)
  getStats: async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*');

      if (error) throw error;

      const total = data.length;
      const active = data.filter(sub => sub.is_active).length;
      const inactive = total - active;

      return {
        total,
        active,
        inactive,
        data
      };

    } catch (error) {
      console.error('Erreur récupération stats newsletter:', error);
      throw error;
    }
  },

  // Envoyer une newsletter hebdomadaire automatique
  sendWeeklyNewsletter: async (data = {}) => {
    try {
      const { data: subscribers, error } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('is_active', true);

      if (error) throw error;

      if (subscribers.length === 0) {
        console.log('📧 Aucun abonné actif pour la newsletter hebdomadaire');
        return { success: true, message: 'Aucun abonné à notifier' };
      }

      const result = await emailService.sendWeeklyNewsletter(subscribers, data);
      console.log('✅ Newsletter hebdomadaire envoyée à', subscribers.length, 'abonnés');
      
      return result;
    } catch (error) {
      console.error('❌ Erreur envoi newsletter hebdomadaire:', error);
      throw error;
    }
  },

  // Envoyer une newsletter mensuelle automatique
  sendMonthlyNewsletter: async (data = {}) => {
    try {
      const { data: subscribers, error } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('is_active', true);

      if (error) throw error;

      if (subscribers.length === 0) {
        console.log('📧 Aucun abonné actif pour la newsletter mensuelle');
        return { success: true, message: 'Aucun abonné à notifier' };
      }

      const result = await emailService.sendMonthlyNewsletter(subscribers, data);
      console.log('✅ Newsletter mensuelle envoyée à', subscribers.length, 'abonnés');
      
      return result;
    } catch (error) {
      console.error('❌ Erreur envoi newsletter mensuelle:', error);
      throw error;
    }
  },

  // Envoyer une offre spéciale
  sendSpecialOffer: async (data = {}) => {
    try {
      const { data: subscribers, error } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('is_active', true);

      if (error) throw error;

      if (subscribers.length === 0) {
        console.log('📧 Aucun abonné actif pour l\'offre spéciale');
        return { success: true, message: 'Aucun abonné à notifier' };
      }

      const result = await emailService.sendSpecialOffer(subscribers, data);
      console.log('✅ Offre spéciale envoyée à', subscribers.length, 'abonnés');
      
      return result;
    } catch (error) {
      console.error('❌ Erreur envoi offre spéciale:', error);
      throw error;
    }
  },

  // Envoyer un email de réengagement aux utilisateurs inactifs
  sendReengagementCampaign: async (data = {}) => {
    try {
      const { data: inactiveSubscribers, error } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('is_active', true)
        .lt('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Inactifs depuis 30 jours

      if (error) throw error;

      if (inactiveSubscribers.length === 0) {
        console.log('📧 Aucun utilisateur inactif pour la campagne de réengagement');
        return { success: true, message: 'Aucun utilisateur inactif à notifier' };
      }

      let successCount = 0;
      for (const subscriber of inactiveSubscribers) {
        try {
          await emailService.sendReengagementEmail(subscriber.email, data);
          successCount++;
        } catch (emailError) {
          console.warn('⚠️ Erreur envoi email réengagement à', subscriber.email, ':', emailError);
        }
      }

      console.log('✅ Campagne de réengagement envoyée à', successCount, 'utilisateurs inactifs');
      
      return {
        success: true,
        message: `Campagne de réengagement envoyée à ${successCount} utilisateurs`,
        stats: { successCount, total: inactiveSubscribers.length }
      };
    } catch (error) {
      console.error('❌ Erreur campagne de réengagement:', error);
      throw error;
    }
  },

  // Envoyer une notification de maintenance
  sendMaintenanceNotification: async (data = {}) => {
    try {
      const { data: subscribers, error } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('is_active', true);

      if (error) throw error;

      if (subscribers.length === 0) {
        console.log('📧 Aucun abonné actif pour la notification de maintenance');
        return { success: true, message: 'Aucun abonné à notifier' };
      }

      const result = await emailService.sendMaintenanceNotification(subscribers, data);
      console.log('✅ Notification de maintenance envoyée à', subscribers.length, 'abonnés');
      
      return result;
    } catch (error) {
      console.error('❌ Erreur notification de maintenance:', error);
      throw error;
    }
  }
};

export default newsletterService;
