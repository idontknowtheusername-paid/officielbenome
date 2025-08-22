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
  }
};

export default newsletterService;
