import React, { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';

export const MobilePaddingAdjuster = ({ children }) => {
  const [isNativeApp, setIsNativeApp] = useState(false);

  // Vérifier si on est dans l'app native Capacitor
  useEffect(() => {
    const checkNativeApp = async () => {
      try {
        const info = await Device.getInfo();
        setIsNativeApp(info.platform !== 'web');
      } catch (error) {
        // Si Device.getInfo() échoue, on est probablement sur le web
        setIsNativeApp(false);
      }
    };
    
    checkNativeApp();
  }, []);

  return (
    <div className={isNativeApp ? 'pb-20' : ''}>
      {children}
    </div>
  );
};
