
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, SECURITY_CONFIG } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useIdleTimer } from '@/hooks/useIdleTimer';
import { IdleWarningModal } from '@/components/IdleWarningModal';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [isRememberMe, setIsRememberMe] = useState(false);
  const { toast } = useToast();

  // Note: La gestion de l'expiration des sessions est automatiquement gérée par Supabase
  // via autoRefreshToken: true. Pas besoin de vérification manuelle.
  // Supabase renouvelle les tokens automatiquement avant expiration.

  // Gestion de l'option "Se souvenir de moi"
  const handleRememberMe = useCallback((remember) => {
    setIsRememberMe(remember);
    
    if (remember) {
      // Sauvegarder la préférence
      localStorage.setItem('maximarket-remember-me', 'true');
      localStorage.setItem('maximarket-remember-date', new Date().toISOString());
    } else {
      // Supprimer la préférence
      localStorage.removeItem('maximarket-remember-me');
      localStorage.removeItem('maximarket-remember-date');
    }
  }, []);

  // Vérifier la préférence "Se souvenir de moi" au chargement
  useEffect(() => {
    const remembered = localStorage.getItem('maximarket-remember-me') === 'true';
    const rememberDate = localStorage.getItem('maximarket-remember-date');
    
    if (remembered && rememberDate) {
      const daysSinceRemember = (Date.now() - new Date(rememberDate).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceRemember <= SECURITY_CONFIG.rememberMeDays) {
        setIsRememberMe(true);
      } else {
        // Expiré, nettoyer
        localStorage.removeItem('maximarket-remember-me');
        localStorage.removeItem('maximarket-remember-date');
        setIsRememberMe(false);
      }
    }
  }, []);

  useEffect(() => {
    // Si Supabase n'est pas configure (production sans variables), on eviter toute action
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Recuperer la session initiale et le profil utilisateur
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      // Si l'utilisateur est connecte, recuperer son profil
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUserProfile(profile);
          
          // Calculer l'expiration de session
          if (session.created_at) {
            const expiryTime = new Date(session.created_at).getTime() + SECURITY_CONFIG.sessionTimeout;
            setSessionExpiry(expiryTime);
          }
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
        
        // Si l'utilisateur est connecte, recuperer son profil
        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            setUserProfile(profile);
            
            // Calculer l'expiration de session
            if (session.created_at) {
              const expiryTime = new Date(session.created_at).getTime() + SECURITY_CONFIG.sessionTimeout;
              setSessionExpiry(expiryTime);
            }
          } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
          }
        } else {
          setUserProfile(null);
          setSessionExpiry(null);
        }
        
        setLoading(false);

        if (event === 'SIGNED_IN') {
          // Mettre a jour/Creer le profil dans public.users via upsert
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
            description: "Bienvenue sur MaxiMarket !",
          });
        } else if (event === 'SIGNED_OUT') {
          // Nettoyer les données de session
          setSessionExpiry(null);
          setIsRememberMe(false);
          localStorage.removeItem('maximarket-remember-me');
          localStorage.removeItem('maximarket-remember-date');
          
          // Notification de déconnexion supprimée - plus de toast inutile
        } else if (event === 'TOKEN_REFRESHED') {
          // Mettre à jour l'expiration après renouvellement
          if (session?.created_at) {
            const expiryTime = new Date(session.created_at).getTime() + SECURITY_CONFIG.sessionTimeout;
            setSessionExpiry(expiryTime);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  const login = async (credentials, rememberMe = false) => {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase non configuré');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      // Gérer l'option "Se souvenir de moi"
      handleRememberMe(rememberMe);

      console.log('Supabase login successful:', data);
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
      // Validation bloquante du numero (format E.164 minimal)
      const phoneRaw = (userData?.phoneNumber || '').trim();
      const e164Regex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRaw) {
        toast({
          title: 'Numéro requis',
          description: 'Le numéro de téléphone est obligatoire pour créer un compte.',
          variant: 'destructive',
        });
        return false;
      }
      if (!e164Regex.test(phoneRaw)) {
        toast({
          title: 'Numéro invalide',
          description: 'Veuillez saisir un numéro de téléphone valide (format international).',
          variant: 'destructive',
        });
        return false;
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

      console.log('Supabase register successful:', data);
      
       // Upsert du profil utilisateur dans la table public.users (assure la presence du telephone)
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

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte !",
        });
        // Ne pas rediriger immediatement, rester sur la page d'inscription
        return { success: true, needsConfirmation: true };
      } else {
        toast({
          title: "Inscription réussie",
          description: "Bienvenue sur MaxiMarket !",
        });
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

  const logout = async (reason = 'manual') => {
    try {
      console.log('🚪 Déconnexion en cours...', { reason });
      
      // Supabase gère automatiquement :
      // - La suppression des tokens
      // - Le nettoyage du localStorage (auth tokens)
      // - La propagation de l'événement SIGNED_OUT
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Le listener onAuthStateChange (ligne 117) va automatiquement :
      // - Nettoyer user, userProfile, session, sessionExpiry
      // - Nettoyer les préférences "remember me"
      // via l'événement SIGNED_OUT
      
      console.log('✅ Déconnexion réussie');
      
      // Afficher un message si déconnexion automatique
      if (reason === 'idle') {
        toast({
          title: "Session expirée",
          description: "Vous avez été déconnecté pour inactivité.",
          variant: "default",
        });
      }

      // Navigation React Router (pas de rechargement forcé)
      // Le composant va se recharger automatiquement avec user = null
      
      return true;
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Fonction pour étendre la session (optionnel)
  const extendSession = async () => {
    try {
      if (!session) return false;
      
      // Forcer le renouvellement du token
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (data.session) {
        const expiryTime = new Date(data.session.created_at).getTime() + SECURITY_CONFIG.sessionTimeout;
        setSessionExpiry(expiryTime);
        
        toast({
          title: "Session étendue",
          description: "Votre session a été prolongée avec succès.",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'extension de session:', error);
      return false;
    }
  };

  // Fonction pour vérifier le statut de la session
  const getSessionStatus = () => {
    if (!session) return 'disconnected';
    
    if (isRememberMe) return 'remembered';
    
    if (sessionExpiry) {
      const now = Date.now();
      const timeLeft = sessionExpiry - now;
      
      if (timeLeft <= 0) return 'expired';
      if (timeLeft <= 5 * 60 * 1000) return 'expiring_soon'; // 5 minutes
      return 'active';
    }
    
    return 'active';
  };

  // Fonction pour obtenir le temps restant de session
  const getSessionTimeLeft = () => {
    if (!sessionExpiry) return 0;
    
    const now = Date.now();
    const timeLeft = sessionExpiry - now;
    
    return Math.max(0, timeLeft);
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

  // Verifie si l'utilisateur a un role specifique
  const hasRole = (role) => {
    if (!user) return false;
    // Utiliser le profil utilisateur en priorite
    if (userProfile?.role) return userProfile.role === role;
    // Fallback sur les metadonnees
    return user.user_metadata?.role === role || user.app_metadata?.role === role;
  };

  // Verifie si l'utilisateur a au moins un des roles specifies
  const hasAnyRole = (roles) => {
    if (!user) return false;
    // Utiliser le profil utilisateur en priorite
    if (userProfile?.role) return roles.includes(userProfile.role);
    // Fallback sur les metadonnees
    const userRole = user.user_metadata?.role || user.app_metadata?.role;
    return roles.includes(userRole);
  };

  // Gestion de l'inactivité - uniquement si l'utilisateur est connecté et n'a pas coché "Se souvenir"
  const handleIdleWarning = useCallback(() => {
    console.log('⚠️ Avertissement d\'inactivité');
  }, []);

  const handleIdle = useCallback(() => {
    console.log('💤 Utilisateur inactif - Déconnexion automatique');
    logout('idle');
  }, []);

  const {
    showWarning: showIdleWarning,
    timeLeft: idleTimeLeft,
    continueSession
  } = useIdleTimer({
    timeout: SECURITY_CONFIG.idleTimeout,
    warningTime: SECURITY_CONFIG.idleWarningTime,
    onIdle: handleIdle,
    onWarning: handleIdleWarning,
    enabled: !!user && !isRememberMe // Activer uniquement si connecté et sans "Se souvenir"
  });

  const value = {
    user: userProfile || user, // Utiliser le profil complet si disponible
    userProfile,
    session,
    sessionExpiry,
    isRememberMe,
    loading,
    login,
    register,
    logout,
    extendSession,
    getSessionStatus,
    getSessionTimeLeft,
    resetPassword,
    updatePassword,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Modal d'avertissement d'inactivité */}
      <IdleWarningModal
        open={showIdleWarning}
        timeLeft={idleTimeLeft}
        onContinue={continueSession}
      />
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
