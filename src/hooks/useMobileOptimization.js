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
          console.log('🚀 Optimisations mobiles activées pour:', info.platform);
          
          // Optimisations spécifiques mobile
          document.body.classList.add('mobile-app');
          
          // Configuration clavier
          try {
            await Keyboard.setAccessoryBarVisible({ isVisible: false });
            console.log('✅ Clavier optimisé');
          } catch (error) {
            console.log('⚠️ Erreur configuration clavier:', error);
          }
          
          // Configuration barre de statut
          try {
            await StatusBar.setStyle({ style: 'dark' });
            await StatusBar.setBackgroundColor({ color: '#ffffff' });
            console.log('✅ Barre de statut configurée');
          } catch (error) {
            console.log('⚠️ Erreur configuration barre de statut:', error);
          }
          
          // Prévention du zoom sur iOS
          const viewport = document.querySelector('meta[name=viewport]');
          if (viewport) {
            viewport.setAttribute('content', 
              'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
            );
            console.log('✅ Viewport optimisé pour mobile');
          }
          
          // Optimisations de performance
          document.body.classList.add('mobile-scroll');
          
          // Prévention des gestes de navigation du navigateur
          document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
              e.preventDefault();
            }
          }, { passive: false });
          
          console.log('✅ Optimisations mobiles terminées');
        } else {
          console.log('🌐 Mode web détecté - optimisations mobiles désactivées');
        }
      } catch (error) {
        console.error('❌ Erreur optimisations mobiles:', error);
      }
    };
    
    optimizeForMobile();
  }, []);
};
