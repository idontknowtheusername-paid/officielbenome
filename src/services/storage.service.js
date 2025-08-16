import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================================
// SERVICE STOCKAGE
// ============================================================================

export const storageService = {
  // Uploader une image (optimise)
  uploadImage: async (file, folder = 'listings') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Verifier le type de fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      // Verifier la taille (max 5MB apres compression)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('L\'image ne doit pas dépasser 5MB');
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${folder}/${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '31536000', // 1 an
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error('Erreur upload Supabase:', error);
        throw new Error(`Erreur lors de l'upload: ${error.message}`);
      }

      // Recuperer l'URL publique avec transformation pour optimisation
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erreur dans uploadImage:', error);
      throw error;
    }
  },

  // Supprimer une image
  deleteImage: async (filePath) => {
    try {
      const { error } = await supabase.storage
        .from('images')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur dans deleteImage:', error);
      throw error;
    }
  },

  // Lister les images d'un utilisateur
  listUserImages: async (userId, folder = 'listings') => {
    try {
      const { data, error } = await supabase.storage
        .from('images')
        .list(`${folder}/${userId}`);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur dans listUserImages:', error);
      throw error;
    }
  }
};
