import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  Eye, 
  Palette, 
  Globe, 
  Save, 
  RotateCcw,
  Download,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { preferencesService } from '../services/preferences.service';
import { useAuth } from '../contexts/AuthContext';

const UserSettings = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  // Charger les preferences
  const loadPreferences = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await preferencesService.getUserPreferences(user.id);
      setPreferences(data);
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder les preferences
  const savePreferences = async () => {
    if (!user || !preferences) return;

    setIsSaving(true);
    try {
      await preferencesService.updateUserPreferences(user.id, preferences);
      setHasChanges(false);
      // Appliquer le theme immediatement
      applyTheme(preferences.theme);
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reinitialiser les preferences
  const resetPreferences = async () => {
    if (!user) return;

    try {
      const defaultPrefs = await preferencesService.resetPreferences(user.id);
      setPreferences(defaultPrefs);
      setHasChanges(false);
      applyTheme(defaultPrefs.theme);
    } catch (error) {
      console.error('Erreur réinitialisation préférences:', error);
    }
  };

  // Exporter les preferences
  const exportPreferences = async () => {
    if (!user) return;

    try {
      const exportData = await preferencesService.exportPreferences(user.id);
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `preferences_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur export préférences:', error);
    }
  };

  // Appliquer le theme
  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Mettre a jour la meta tag pour la couleur du theme
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff');
    }
  };

  // Mettre a jour une preference
  const updatePreference = (path, value) => {
    if (!preferences) return;

    const newPreferences = { ...preferences };
    const keys = path.split('.');
    let current = newPreferences;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setPreferences(newPreferences);
    setHasChanges(true);
  };

  // Charger au montage
  useEffect(() => {
    loadPreferences();
  }, [user]);

  // Appliquer le theme au chargement
  useEffect(() => {
    if (preferences?.theme) {
      applyTheme(preferences.theme);
    }
  }, [preferences?.theme]);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Connectez-vous pour accéder aux paramètres</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des paramètres...</p>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Erreur lors du chargement des paramètres</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600 mt-2">
              Personnalisez votre expérience sur la plateforme
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <button
                onClick={savePreferences}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={16} />
                <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            )}
            <button
              onClick={exportPreferences}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Download size={16} />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: 'Général', icon: Settings },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Confidentialité', icon: Eye },
            { id: 'security', label: 'Sécurité', icon: Shield },
            { id: 'appearance', label: 'Apparence', icon: Palette }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="bg-white rounded-lg shadow">
        {/* Onglet Général */}
        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Paramètres généraux</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Langue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Langue
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => updatePreference('language', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="pt">Português</option>
                </select>
              </div>

              {/* Devise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise
                </label>
                <select
                  value={preferences.currency}
                  onChange={(e) => updatePreference('currency', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="XOF">Franc CFA (XOF)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">Dollar US (USD)</option>
                  <option value="GBP">Livre Sterling (GBP)</option>
                </select>
              </div>

              {/* Fuseau horaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuseau horaire
                </label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => updatePreference('timezone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Africa/Abidjan">Afrique/Abidjan</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="America/New_York">Amérique/New York</option>
                  <option value="Asia/Tokyo">Asie/Tokyo</option>
                </select>
              </div>

              {/* Format de date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format de date
                </label>
                <select
                  value={preferences.date_format}
                  onChange={(e) => updatePreference('date_format', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Notifications */}
        {activeTab === 'notifications' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Paramètres de notifications</h2>
            
            {/* Notifications email */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications par email</h3>
              <div className="space-y-4">
                {Object.entries(preferences.email_notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {key === 'new_messages' && 'Nouveaux messages'}
                        {key === 'listing_updates' && 'Mises à jour d\'annonces'}
                        {key === 'transaction_updates' && 'Mises à jour de transactions'}
                        {key === 'marketing' && 'Emails marketing'}
                        {key === 'weekly_digest' && 'Résumé hebdomadaire'}
                      </label>
                      <p className="text-sm text-gray-500">
                        {key === 'new_messages' && 'Recevoir des notifications pour les nouveaux messages'}
                        {key === 'listing_updates' && 'Être informé des mises à jour de vos annonces'}
                        {key === 'transaction_updates' && 'Suivre l\'état de vos transactions'}
                        {key === 'marketing' && 'Recevoir des offres et promotions'}
                        {key === 'weekly_digest' && 'Recevoir un résumé hebdomadaire de votre activité'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updatePreference(`email_notifications.${key}`, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications push */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications push</h3>
              <div className="space-y-4">
                {Object.entries(preferences.push_notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {key === 'new_messages' && 'Nouveaux messages'}
                        {key === 'listing_updates' && 'Mises à jour d\'annonces'}
                        {key === 'transaction_updates' && 'Mises à jour de transactions'}
                        {key === 'marketing' && 'Notifications marketing'}
                      </label>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updatePreference(`push_notifications.${key}`, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Confidentialité */}
        {activeTab === 'privacy' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Paramètres de confidentialité</h2>
            
            <div className="space-y-6">
              {Object.entries(preferences.privacy_settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {key === 'profile_visibility' && 'Visibilité du profil'}
                      {key === 'show_online_status' && 'Statut en ligne'}
                      {key === 'allow_messages' && 'Autoriser les messages'}
                      {key === 'show_last_seen' && 'Dernière connexion'}
                    </label>
                    <p className="text-sm text-gray-500">
                      {key === 'profile_visibility' && 'Contrôler qui peut voir votre profil'}
                      {key === 'show_online_status' && 'Afficher votre statut en ligne'}
                      {key === 'allow_messages' && 'Permettre aux autres de vous envoyer des messages'}
                      {key === 'show_last_seen' && 'Afficher votre dernière activité'}
                    </p>
                  </div>
                  {key === 'profile_visibility' ? (
                    <select
                      value={value}
                      onChange={(e) => updatePreference('privacy_settings.profile_visibility', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Amis uniquement</option>
                      <option value="private">Privé</option>
                    </select>
                  ) : (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updatePreference(`privacy_settings.${key}`, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Sécurité */}
        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Paramètres de sécurité</h2>
            
            <div className="space-y-6">
              {Object.entries(preferences.security_settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {key === 'two_factor_auth' && 'Authentification à deux facteurs'}
                      {key === 'login_notifications' && 'Notifications de connexion'}
                      {key === 'session_timeout' && 'Délai d\'expiration de session'}
                      {key === 'require_password_change' && 'Changement de mot de passe obligatoire'}
                    </label>
                    <p className="text-sm text-gray-500">
                      {key === 'two_factor_auth' && 'Ajouter une couche de sécurité supplémentaire'}
                      {key === 'login_notifications' && 'Être informé des nouvelles connexions'}
                      {key === 'session_timeout' && 'Délai avant déconnexion automatique (minutes)'}
                      {key === 'require_password_change' && 'Forcer le changement de mot de passe'}
                    </p>
                  </div>
                  {key === 'session_timeout' ? (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => updatePreference('security_settings.session_timeout', parseInt(e.target.value))}
                      className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      min="5"
                      max="1440"
                    />
                  ) : (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updatePreference(`security_settings.${key}`, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Apparence */}
        {activeTab === 'appearance' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Paramètres d'apparence</h2>
            
            {/* Thème */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Thème</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'light', label: 'Clair', icon: Sun },
                  { value: 'dark', label: 'Sombre', icon: Moon },
                  { value: 'auto', label: 'Auto', icon: Monitor }
                ].map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <button
                      key={theme.value}
                      onClick={() => updatePreference('theme', theme.value)}
                      className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                        preferences.theme === theme.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={24} className="mb-2" />
                      <span className="text-sm font-medium">{theme.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Taille de police */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille de police
              </label>
              <select
                value={preferences.customization.font_size}
                onChange={(e) => updatePreference('customization.font_size', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Petite</option>
                <option value="medium">Moyenne</option>
                <option value="large">Grande</option>
              </select>
            </div>

            {/* Animations */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Animations
                </label>
                <p className="text-sm text-gray-500">
                  Activer les animations et transitions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.customization.animations_enabled}
                  onChange={(e) => updatePreference('customization.animations_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Actions de réinitialisation */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={resetPreferences}
          className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-800"
        >
          <RotateCcw size={16} />
          <span>Réinitialiser les paramètres</span>
        </button>
      </div>
    </div>
  );
};

export default UserSettings; 