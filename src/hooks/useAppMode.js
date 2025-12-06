import { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';

/**
 * Hook pour détecter si l'app est en mode "app" (native ou PWA installée)
 * vs mode "web" (navigateur classique)
 */
export const useAppMode = () => {
  const [isAppMode, setIsAppMode] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectAppMode = async () => {
      try {
        // 1. Vérifier si c'est une app native (Capacitor iOS/Android)
        const info = await Device.getInfo();
        const native = info.platform !== 'web';
        setIsNativeApp(native);

        // 2. Vérifier si c'est une PWA installée (standalone mode)
        const pwa = window.matchMedia('(display-mode: standalone)').matches ||
                    window.navigator.standalone === true || // iOS Safari
                    document.referrer.includes('android-app://'); // Android TWA
        setIsPWA(pwa);

        // 3. Mode app = native OU PWA installée
        setIsAppMode(native || pwa);
      } catch (error) {
        // En cas d'erreur, vérifier juste la PWA
        const pwa = window.matchMedia('(display-mode: standalone)').matches ||
                    window.navigator.standalone === true;
        setIsPWA(pwa);
        setIsAppMode(pwa);
      } finally {
        setIsLoading(false);
      }
    };

    detectAppMode();

    // Écouter les changements de display-mode (si l'utilisateur installe la PWA)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e) => {
      setIsPWA(e.matches);
      setIsAppMode(isNativeApp || e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isNativeApp]);

  return { isAppMode, isNativeApp, isPWA, isLoading };
};

export default useAppMode;
