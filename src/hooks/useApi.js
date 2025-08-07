import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/app';
import { supabase } from '@/lib/supabase';

/**
 * Custom hook pour gérer les appels Supabase de manière centralisée
 * @param {Object} options - Options de configuration
 * @param {boolean} [options.showSuccess] - Afficher un toast de succès
 * @param {boolean} [options.showError] - Afficher un toast d'erreur
 * @param {boolean} [options.redirectOnSuccess] - Rediriger après un succès
 * @param {string} [options.redirectPath] - Chemin de redirection
 * @param {boolean} [options.redirectToLogin] - Rediriger vers la page de connexion en cas d'erreur 401
 * @param {boolean} [options.throwError] - Lancer l'erreur pour la gestion en amont
 * @returns {Object} - Fonctions et états pour gérer les appels Supabase
 */
const useApi = (options = {}) => {
  const {
    showSuccess = true,
    showError = true,
    redirectOnSuccess = false,
    redirectPath = '',
    redirectToLogin = true,
    throwError = false,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(null);
  const controllerRef = useRef(null);
  const navigate = useNavigate();

  // Annuler la requête en cours lors du démontage du composant
  useEffect(() => {
    const controller = controllerRef.current;
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, []);

  /**
   * Exécute une requête Supabase
   * @param {Function} supabaseCall - Fonction Supabase à exécuter
   * @param {Object} config - Configuration supplémentaire
   * @returns {Promise<Object>} - Réponse de Supabase
   */
  const callSupabase = useCallback(
    async (supabaseCall, config = {}) => {
      // Annuler la requête précédente si elle existe
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      // Créer un nouveau contrôleur pour cette requête
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const result = await supabaseCall();

        // Vérifier si la requête a été annulée
        if (controller.signal.aborted) {
          return null;
        }

        // Gérer les erreurs Supabase
        if (result.error) {
          throw result.error;
        }

        setData(result.data);
        setStatus(200);

        // Afficher un message de succès si nécessaire
        if (showSuccess && result.data?.message) {
          toast.success(result.data.message);
        }

        // Rediriger si nécessaire
        if (redirectOnSuccess) {
          navigate(redirectPath || ROUTES.DASHBOARD);
        }

        return result.data;
      } catch (err) {
        // Ignorer les erreurs d'annulation
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          return null;
        }

        const errorData = { message: err.message };
        const errorStatus = err.status || 500;
        
        setError(errorData);
        setStatus(errorStatus);

        // Gérer les erreurs spécifiques
        if (errorStatus === 401 && redirectToLogin) {
          // Rediriger vers la page de connexion avec la redirection actuelle
          navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(window.location.pathname)}`);
          return null;
        }

        // Afficher un message d'erreur si nécessaire
        if (showError) {
          const errorMessage = errorData.message || 'Une erreur est survenue';
          toast.error(errorMessage);
        }

        // Lancer l'erreur si nécessaire
        if (throwError) {
          throw err;
        }

        return null;
      } finally {
        // Ne pas mettre à jour l'état si la requête a été annulée
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [navigate, redirectOnSuccess, redirectPath, showError, showSuccess, throwError, redirectToLogin]
  );

  // Méthodes pour les opérations CRUD courantes
  const select = useCallback((table, query = {}) => {
    return callSupabase(() => supabase.from(table).select(query.select || '*').eq(query.eq?.field, query.eq?.value), query);
  }, [callSupabase]);

  const insert = useCallback((table, data) => {
    return callSupabase(() => supabase.from(table).insert(data).select(), {});
  }, [callSupabase]);

  const update = useCallback((table, data, conditions = {}) => {
    let query = supabase.from(table).update(data).select();
    
    if (conditions.eq) {
      query = query.eq(conditions.eq.field, conditions.eq.value);
    }
    
    return callSupabase(() => query, {});
  }, [callSupabase]);

  const remove = useCallback((table, conditions = {}) => {
    let query = supabase.from(table).delete();
    
    if (conditions.eq) {
      query = query.eq(conditions.eq.field, conditions.eq.value);
    }
    
    return callSupabase(() => query, {});
  }, [callSupabase]);

  // Méthodes pour l'authentification
  const signIn = useCallback((email, password) => {
    return callSupabase(() => supabase.auth.signInWithPassword({ email, password }), {});
  }, [callSupabase]);

  const signUp = useCallback((email, password, userData = {}) => {
    return callSupabase(() => supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    }), {});
  }, [callSupabase]);

  const signOut = useCallback(() => {
    return callSupabase(() => supabase.auth.signOut(), {});
  }, [callSupabase]);

  // Méthodes pour le storage
  const uploadFile = useCallback((bucket, path, file) => {
    return callSupabase(() => supabase.storage.from(bucket).upload(path, file), {});
  }, [callSupabase]);

  const downloadFile = useCallback((bucket, path) => {
    return callSupabase(() => supabase.storage.from(bucket).download(path), {});
  }, [callSupabase]);

  const deleteFile = useCallback((bucket, path) => {
    return callSupabase(() => supabase.storage.from(bucket).remove([path]), {});
  }, [callSupabase]);

  // Réinitialiser l'état
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
    setStatus(null);
  }, []);

  // Annuler la requête en cours
  const cancelRequest = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
      setLoading(false);
    }
  }, []);

  return {
    // États
    loading,
    error,
    data,
    status,
    
    // Méthodes CRUD
    select,
    insert,
    update,
    remove,
    
    // Méthodes d'authentification
    signIn,
    signUp,
    signOut,
    
    // Méthodes de storage
    uploadFile,
    downloadFile,
    deleteFile,
    
    // Méthodes utilitaires
    callSupabase,
    reset,
    cancelRequest,
    
    // Alias pour la compatibilité
    execute: callSupabase,
    isLoading: loading,
    isError: !!error,
    isSuccess: !!data && !error,
    
    // Méthodes HTTP pour la compatibilité (dépréciées)
    get: select,
    post: insert,
    put: update,
    patch: update,
    delete: remove,
  };
};

export default useApi;
