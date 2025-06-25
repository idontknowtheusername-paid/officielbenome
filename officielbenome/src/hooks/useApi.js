import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/app';
import { api } from '@/lib/api';

/**
 * Custom hook pour gérer les appels API de manière centralisée
 * @param {Object} options - Options de configuration
 * @param {boolean} [options.showSuccess] - Afficher un toast de succès
 * @param {boolean} [options.showError] - Afficher un toast d'erreur
 * @param {boolean} [options.redirectOnSuccess] - Rediriger après un succès
 * @param {string} [options.redirectPath] - Chemin de redirection
 * @param {boolean} [options.redirectToLogin] - Rediriger vers la page de connexion en cas d'erreur 401
 * @param {boolean} [options.throwError] - Lancer l'erreur pour la gestion en amont
 * @returns {Object} - Fonctions et états pour gérer les appels API
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
   * Exécute une requête API
   * @param {string} method - Méthode HTTP (get, post, put, delete, etc.)
   * @param {string} url - URL de l'API
   * @param {Object} requestData - Données à envoyer (pour POST, PUT, PATCH)
   * @param {Object} config - Configuration supplémentaire pour axios
   * @returns {Promise<Object>} - Réponse de l'API
   */
  const callApi = useCallback(
    async (method, url, requestData = null, config = {}) => {
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
        const response = await api({
          method,
          url,
          data: requestData,
          signal: controller.signal,
          ...config,
        });

        setData(response.data);
        setStatus(response.status);

        // Afficher un message de succès si nécessaire
        if (showSuccess && response.data?.message) {
          toast.success(response.data.message);
        }

        // Rediriger si nécessaire
        if (redirectOnSuccess) {
          navigate(redirectPath || ROUTES.DASHBOARD);
        }

        return response.data;
      } catch (err) {
        // Ignorer les erreurs d'annulation
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          return null;
        }

        const errorData = err.response?.data || { message: err.message };
        const errorStatus = err.response?.status;
        
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

  // Méthodes HTTP courantes
  const get = useCallback((url, config = {}) => callApi('get', url, null, config), [callApi]);
  const post = useCallback((url, data, config = {}) => callApi('post', url, data, config), [callApi]);
  const put = useCallback((url, data, config = {}) => callApi('put', url, data, config), [callApi]);
  const patch = useCallback((url, data, config = {}) => callApi('patch', url, data, config), [callApi]);
  const del = useCallback((url, config = {}) => callApi('delete', url, null, config), [callApi]);

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
    
    // Méthodes
    callApi,
    get,
    post,
    put,
    patch,
    delete: del,
    reset,
    cancelRequest,
    
    // Alias pour la compatibilité
    execute: callApi,
    isLoading: loading,
    isError: !!error,
    isSuccess: !!data && !error,
  };
};

export default useApi;
