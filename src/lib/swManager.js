class ServiceWorkerManager {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
    this.registration = null;
    this.updateAvailable = false;
  }

  async register() {
    if (!this.isSupported) {
      console.warn('⚠️ Service Worker non supporté par ce navigateur');
      return false;
    }

    try {
      console.log('🔄 Enregistrement du Service Worker...');
      
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service Worker enregistré:', this.registration);

      // Écouter les mises à jour
      this.registration.addEventListener('updatefound', () => {
        console.log('🔄 Mise à jour du Service Worker disponible');
        this.updateAvailable = true;
      });

      // Écouter les changements d'état
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('✅ Nouveau Service Worker activé');
        this.updateAvailable = false;
        // Recharger la page pour utiliser le nouveau SW
        window.location.reload();
      });

      // Écouter les messages du Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message du Service Worker:', event.data);
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error);
      return false;
    }
  }

  async unregister() {
    if (this.registration) {
      try {
        await this.registration.unregister();
        console.log('✅ Service Worker désenregistré');
        return true;
      } catch (error) {
        console.error('❌ Erreur lors du désenregistrement:', error);
        return false;
      }
    }
    return false;
  }

  async update() {
    if (this.registration && this.updateAvailable) {
      try {
        // Envoyer un message au Service Worker pour déclencher la mise à jour
        this.registration.active.postMessage({ type: 'SKIP_WAITING' });
        console.log('🔄 Mise à jour du Service Worker déclenchée');
        return true;
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        return false;
      }
    }
    return false;
  }

  async clearCache() {
    if (this.registration) {
      try {
        // Envoyer un message au Service Worker pour vider le cache
        this.registration.active.postMessage({ type: 'CLEAR_CACHE' });
        console.log('🗑️ Vidage du cache demandé');
        return true;
      } catch (error) {
        console.error('❌ Erreur lors du vidage du cache:', error);
        return false;
      }
    }
    return false;
  }

  getStatus() {
    return {
      isSupported: this.isSupported,
      isRegistered: !!this.registration,
      updateAvailable: this.updateAvailable,
      scope: this.registration?.scope || null
    };
  }
}

// Instance singleton
export const swManager = new ServiceWorkerManager(); 