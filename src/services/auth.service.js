import { supabase } from '@/lib/supabase';

const AuthService = {
  // Se connecter
  async login(credentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) throw error;
      
      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // S'inscrire
  async register(userData) {
    try {
      // Validation bloquante du numéro (format E.164 minimal)
      const phoneRaw = (userData?.phoneNumber || '').trim();
      const e164Regex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRaw) {
        throw new Error('Le numéro de téléphone est obligatoire pour créer un compte.');
      }
      if (!e164Regex.test(phoneRaw)) {
        throw new Error('Veuillez saisir un numéro de téléphone valide (format international).');
      }
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone_number: phoneRaw,
          }
        }
      });

      if (error) throw error;

      // Upsert du profil utilisateur dans la table public.users (évite les doublons et s'assure du téléphone)
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert([
            {
              id: data.user.id,
              first_name: userData.firstName,
              last_name: userData.lastName,
              email: userData.email,
              phone_number: phoneRaw,
              role: 'user'
            }
          ], { onConflict: 'id' });

        if (profileError) {
          console.error('Profile upsert error:', profileError);
        }
      }

      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Se déconnecter
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Récupérer le profil utilisateur
  async getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    return !!supabase.auth.getSession();
  },

  // Réinitialiser le mot de passe
  async forgotPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { message: 'Email de réinitialisation envoyé' };
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Réinitialiser le mot de passe avec un token
  async resetPassword(token, password) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      return { message: 'Mot de passe mis à jour avec succès' };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Mettre à jour le profil utilisateur
  async updateProfile(updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Récupérer la session actuelle
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  }
};

export default AuthService;
