// ============================================================================
// SERVICE BREVO - GESTION DES LISTES DE CONTACTS (API REST)
// Compatible navigateur - N'utilise PAS le SDK @getbrevo/brevo
// ============================================================================

const BREVO_API_KEY = import.meta.env?.VITE_BREVO_API_KEY || process.env.VITE_BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';

// Helper pour les requêtes API
const brevoFetch = async (endpoint, options = {}) => {
  if (!BREVO_API_KEY) {
    throw new Error('Clé API Brevo non configurée');
  }

  const response = await fetch(`${BREVO_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `Erreur API Brevo: ${response.status}`);
  }

  return data;
};

export const brevoListsService = {
  /**
   * Créer une liste de contacts
   * @param {string} name - Nom de la liste
   * @param {number} folderId - ID du dossier (optionnel)
   */
  createList: async (name, folderId = null) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Liste Brevo créée:', name);
        return { success: true, listId: 'sim-' + Date.now() };
      }

      const payload = { name };
      if (folderId) payload.folderId = folderId;

      const result = await brevoFetch('/contacts/lists', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      console.log('✅ Liste Brevo créée:', result.id);
      
      return {
        success: true,
        listId: result.id,
        message: 'Liste créée avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur création liste Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtenir toutes les listes
   * @param {number} limit - Nombre de résultats
   * @param {number} offset - Décalage
   */
  getAllLists: async (limit = 50, offset = 0) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Récupération listes Brevo');
        return { success: true, lists: [] };
      }

      const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
      const result = await brevoFetch(`/contacts/lists?${params}`);
      
      console.log('✅ Listes Brevo récupérées:', result.lists?.length || 0);
      
      return {
        success: true,
        lists: result.lists || [],
        count: result.count || 0
      };

    } catch (error) {
      console.error('❌ Erreur récupération listes Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtenir une liste spécifique
   * @param {number} listId - ID de la liste
   */
  getList: async (listId) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Récupération liste Brevo:', listId);
        return { success: true, list: null };
      }

      const list = await brevoFetch(`/contacts/lists/${listId}`);
      console.log('✅ Liste Brevo récupérée:', listId);
      
      return {
        success: true,
        list
      };

    } catch (error) {
      console.error('❌ Erreur récupération liste Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Mettre à jour une liste
   * @param {number} listId - ID de la liste
   * @param {string} name - Nouveau nom
   * @param {number} folderId - Nouveau dossier (optionnel)
   */
  updateList: async (listId, name, folderId = null) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Liste Brevo mise à jour:', listId);
        return { success: true, message: 'Liste simulée mise à jour' };
      }

      const payload = { name };
      if (folderId) payload.folderId = folderId;

      await brevoFetch(`/contacts/lists/${listId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      console.log('✅ Liste Brevo mise à jour:', listId);
      
      return {
        success: true,
        message: 'Liste mise à jour avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur mise à jour liste Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Supprimer une liste
   * @param {number} listId - ID de la liste
   */
  deleteList: async (listId) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Liste Brevo supprimée:', listId);
        return { success: true, message: 'Liste simulée supprimée' };
      }

      await brevoFetch(`/contacts/lists/${listId}`, {
        method: 'DELETE'
      });

      console.log('✅ Liste Brevo supprimée:', listId);
      
      return {
        success: true,
        message: 'Liste supprimée avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur suppression liste Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtenir les contacts d'une liste
   * @param {number} listId - ID de la liste
   * @param {number} limit - Nombre de résultats
   * @param {number} offset - Décalage
   */
  getListContacts: async (listId, limit = 50, offset = 0) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Récupération contacts liste Brevo:', listId);
        return { success: true, contacts: [] };
      }

      const params = new URLSearchParams({ 
        limit: limit.toString(), 
        offset: offset.toString() 
      });
      const result = await brevoFetch(`/contacts/lists/${listId}/contacts?${params}`);
      
      console.log('✅ Contacts liste Brevo récupérés:', result.contacts?.length || 0);
      
      return {
        success: true,
        contacts: result.contacts || [],
        count: result.count || 0
      };

    } catch (error) {
      console.error('❌ Erreur récupération contacts liste Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Créer un dossier pour organiser les listes
   * @param {string} name - Nom du dossier
   */
  createFolder: async (name) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Dossier Brevo créé:', name);
        return { success: true, folderId: 'sim-' + Date.now() };
      }

      const result = await brevoFetch('/contacts/folders', {
        method: 'POST',
        body: JSON.stringify({ name })
      });

      console.log('✅ Dossier Brevo créé:', result.id);
      
      return {
        success: true,
        folderId: result.id,
        message: 'Dossier créé avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur création dossier Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtenir tous les dossiers
   * @param {number} limit - Nombre de résultats
   * @param {number} offset - Décalage
   */
  getAllFolders: async (limit = 50, offset = 0) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Récupération dossiers Brevo');
        return { success: true, folders: [] };
      }

      const params = new URLSearchParams({ 
        limit: limit.toString(), 
        offset: offset.toString() 
      });
      const result = await brevoFetch(`/contacts/folders?${params}`);
      
      console.log('✅ Dossiers Brevo récupérés:', result.folders?.length || 0);
      
      return {
        success: true,
        folders: result.folders || [],
        count: result.count || 0
      };

    } catch (error) {
      console.error('❌ Erreur récupération dossiers Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Synchroniser les abonnés newsletter avec Brevo
   * @param {Array} subscribers - Liste des abonnés depuis Supabase
   * @param {number} listId - ID de la liste Brevo
   */
  syncNewsletterSubscribers: async (subscribers, listId) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Synchronisation abonnés Brevo');
        return { success: true, synced: subscribers.length };
      }

      let successCount = 0;
      let errorCount = 0;

      for (const subscriber of subscribers) {
        try {
          const payload = {
            email: subscriber.email,
            listIds: [listId],
            attributes: {
              SUBSCRIBED_AT: subscriber.subscribed_at,
              SOURCE: subscriber.source || 'website',
              IS_ACTIVE: subscriber.is_active
            },
            updateEnabled: true
          };

          await brevoFetch('/contacts', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          
          successCount++;
        } catch (error) {
          // Si le contact existe déjà, le mettre à jour
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            try {
              const updatePayload = {
                listIds: [listId],
                attributes: {
                  SUBSCRIBED_AT: subscriber.subscribed_at,
                  SOURCE: subscriber.source || 'website',
                  IS_ACTIVE: subscriber.is_active
                }
              };

              await brevoFetch(`/contacts/${encodeURIComponent(subscriber.email)}`, {
                method: 'PUT',
                body: JSON.stringify(updatePayload)
              });
              
              successCount++;
            } catch (updateError) {
              console.error('❌ Erreur mise à jour contact:', subscriber.email);
              errorCount++;
            }
          } else {
            console.error('❌ Erreur création contact:', subscriber.email);
            errorCount++;
          }
        }
      }

      console.log(`✅ Synchronisation Brevo: ${successCount} succès, ${errorCount} erreurs`);
      
      return {
        success: true,
        synced: successCount,
        errors: errorCount,
        total: subscribers.length
      };

    } catch (error) {
      console.error('❌ Erreur synchronisation Brevo:', error);
      return { success: false, error: error.message };
    }
  }
};

export default brevoListsService;
