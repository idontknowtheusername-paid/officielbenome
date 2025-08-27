import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';

export const MobileNavigation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const initializeMobileNav = async () => {
      try {
        console.log('🚀 Initializing mobile navigation...');
        
        // Gestion du bouton retour Android
        App.addListener('backButton', ({ canGoBack }) => {
          console.log('📱 Back button pressed, canGoBack:', canGoBack);
          if (!canGoBack) {
            console.log('🚪 Exiting app...');
            App.exitApp();
          } else {
            console.log('⬅️ Navigating back...');
            navigate(-1);
          }
        });

        // Configuration de la barre de statut
        console.log('📊 Configuring status bar...');
        await StatusBar.setStyle({ style: 'dark' });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
        console.log('✅ Status bar configured successfully');
        
        console.log('✅ Mobile navigation initialized successfully');
      } catch (error) {
        console.error('❌ Mobile navigation initialization error:', error);
      }
    };

    initializeMobileNav();
  }, [navigate]);

  return null;
};
