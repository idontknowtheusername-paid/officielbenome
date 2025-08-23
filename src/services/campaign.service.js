import { supabase } from '@/lib/supabase';

// ============================================================================
// SERVICE DE GESTION DES CAMPAGNES EMAIL
// ============================================================================

export const campaignService = {
  // Créer une nouvelle campagne
  createCampaign: async (campaignData) => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert([{
          type: campaignData.type,
          subject: campaignData.subject,
          data: campaignData.data,
          scheduled_date: campaignData.scheduledDate,
          status: 'draft',
          created_by: campaignData.createdBy,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      console.log('✅ Campagne créée:', data[0]);
      return data[0];

    } catch (error) {
      console.error('❌ Erreur création campagne:', error);
      throw error;
    }
  },

  // Envoyer une campagne
  sendCampaign: async (campaignId) => {
    try {
      // Récupérer la campagne
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Mettre à jour le statut
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({
          status: 'sending',
          sent_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (updateError) throw updateError;

      console.log('✅ Campagne envoyée:', campaign);
      return campaign;

    } catch (error) {
      console.error('❌ Erreur envoi campagne:', error);
      throw error;
    }
  },

  // Obtenir toutes les campagnes
  getAllCampaigns: async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('❌ Erreur récupération campagnes:', error);
      throw error;
    }
  },

  // Obtenir une campagne par ID
  getCampaignById: async (campaignId) => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('❌ Erreur récupération campagne:', error);
      throw error;
    }
  },

  // Mettre à jour une campagne
  updateCampaign: async (campaignId, updates) => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .select();

      if (error) throw error;

      console.log('✅ Campagne mise à jour:', data[0]);
      return data[0];

    } catch (error) {
      console.error('❌ Erreur mise à jour campagne:', error);
      throw error;
    }
  },

  // Supprimer une campagne
  deleteCampaign: async (campaignId) => {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      console.log('✅ Campagne supprimée:', campaignId);
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur suppression campagne:', error);
      throw error;
    }
  },

  // Obtenir les statistiques des campagnes
  getCampaignStats: async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*');

      if (error) throw error;

      const stats = {
        total: data.length,
        sent: data.filter(c => c.status === 'sent').length,
        draft: data.filter(c => c.status === 'draft').length,
        sending: data.filter(c => c.status === 'sending').length,
        failed: data.filter(c => c.status === 'failed').length,
        byType: {}
      };

      // Statistiques par type
      data.forEach(campaign => {
        if (!stats.byType[campaign.type]) {
          stats.byType[campaign.type] = 0;
        }
        stats.byType[campaign.type]++;
      });

      return stats;

    } catch (error) {
      console.error('❌ Erreur statistiques campagnes:', error);
      throw error;
    }
  },

  // Programmer une campagne
  scheduleCampaign: async (campaignId, scheduledDate) => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({
          status: 'scheduled',
          scheduled_date: scheduledDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .select();

      if (error) throw error;

      console.log('✅ Campagne programmée:', data[0]);
      return data[0];

    } catch (error) {
      console.error('❌ Erreur programmation campagne:', error);
      throw error;
    }
  },

  // Dupliquer une campagne
  duplicateCampaign: async (campaignId) => {
    try {
      // Récupérer la campagne originale
      const originalCampaign = await campaignService.getCampaignById(campaignId);
      
      // Créer une copie
      const duplicatedCampaign = {
        ...originalCampaign,
        id: undefined,
        subject: `${originalCampaign.subject} (Copie)`,
        status: 'draft',
        created_at: new Date().toISOString(),
        sent_at: null,
        scheduled_date: null
      };

      delete duplicatedCampaign.id;

      const { data, error } = await supabase
        .from('email_campaigns')
        .insert([duplicatedCampaign])
        .select();

      if (error) throw error;

      console.log('✅ Campagne dupliquée:', data[0]);
      return data[0];

    } catch (error) {
      console.error('❌ Erreur duplication campagne:', error);
      throw error;
    }
  }
};

export default campaignService;
