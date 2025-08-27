import { useEffect } from 'react';
import { Device } from '@capacitor/device';
import { StatusBar } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';

export const useMobileOptimization = () => {
  useEffect(() => {
    const optimizeForMobile = async () => {
      try {
        const info = await Device.getInfo();
        
        if (info.platform !== 'web') {
          // Optimisations spécifiques mobile
          document.body.classList.add('mobile-app');
          
          // Configuration clavier
          await Keyboard.setAccessoryBarVisible({ isVisible: false });
          
          // Configuration barre de statut
          await StatusBar.setStyle({ style: 'dark' });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          
          // Prévention du zoom sur iOS
          const viewport = document.querySelector('meta[name=viewport]');
          if (viewport) {
            viewport.setAttribute('content', 
              'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
            );
          }
        }
      } catch (error) {
        console.error('Mobile optimization error:', error);
      }
    };
    
    optimizeForMobile();
  }, []);
};
