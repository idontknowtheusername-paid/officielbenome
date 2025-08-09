
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Si Supabase n'est pas configuré (production sans variables), on éviter toute action
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Récupérer la session initiale et le profil utilisateur
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      // Si l'utilisateur est connecté, récupérer son profil
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUserProfile(profile);
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
        }
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Si l'utilisateur est connecté, récupérer son profil
        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            setUserProfile(profile);
          } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
          }
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);

        if (event === 'SIGNED_IN') {
          // Mettre à jour/Créer le profil dans public.users via upsert
          if (session?.user) {
            const profilePayload = {
              id: session.user.id,
              first_name: session.user.user_metadata?.first_name || '',
              last_name: session.user.user_metadata?.last_name || '',
              email: session.user.email,
              phone_number: session.user.user_metadata?.phone_number || '',
              role: 'user'
            };

            const { error: upsertError } = await supabase
              .from('users')
              .upsert([profilePayload], { onConflict: 'id' });

            if (upsertError) {
              console.error('Profile upsert error:', upsertError);
            }
          }

          toast({
            title: "Connexion réussie",
            description: "Bienvenue sur Officiel BenoMe !",
          });
          // Rediriger automatiquement après confirmation/connexion
          navigate('/');
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Déconnexion réussie",
            description: "À bientôt !",
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  const login = async (credentials) => {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase non configuré');
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      console.log('Supabase login successful:', data);
      navigate('/');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

   const register = async (userData) => {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase non configuré');
      }
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
             phone_number: userData.phoneNumber,
          }
        }
      });

      if (error) throw error;

      console.log('Supabase register successful:', data);
      
       // Upsert du profil utilisateur dans la table public.users (assure la présence du téléphone)
       if (data.user) {
         const { error: profileError } = await supabase
           .from('users')
           .upsert([
             {
               id: data.user.id,
               first_name: userData.firstName,
               last_name: userData.lastName,
               email: userData.email,
               phone_number: userData.phoneNumber,
               role: 'user'
             }
           ], { onConflict: 'id' });

         if (profileError) {
           console.error('Profile upsert error:', profileError);
         }
       }

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte !",
        });
        // Ne pas rediriger immédiatement, rester sur la page d'inscription
        return { success: true, needsConfirmation: true };
      } else {
        toast({
          title: "Inscription réussie",
          description: "Bienvenue sur Officiel BenoMe !",
        });
        navigate('/');
        return { success: true, needsConfirmation: false };
      }
    } catch (error) {
      console.error('Register error:', error);
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
      });
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      });
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Vérifie si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    if (!user) return false;
    // Utiliser le profil utilisateur en priorité
    if (userProfile?.role) return userProfile.role === role;
    // Fallback sur les métadonnées
    return user.user_metadata?.role === role || user.app_metadata?.role === role;
  };

  // Vérifie si l'utilisateur a au moins un des rôles spécifiés
  const hasAnyRole = (roles) => {
    if (!user) return false;
    // Utiliser le profil utilisateur en priorité
    if (userProfile?.role) return roles.includes(userProfile.role);
    // Fallback sur les métadonnées
    const userRole = user.user_metadata?.role || user.app_metadata?.role;
    return roles.includes(userRole);
  };

  const value = {
    user: userProfile || user, // Utiliser le profil complet si disponible
    userProfile,
    session,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
