import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Settings, Palette, Bell, Shield, Database, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { settingsService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Récupérer les paramètres depuis le service
  const { data: initialSettings, isLoading, error } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: () => settingsService.getSystemSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const [settings, setSettings] = useState({});

  // Initialiser les paramètres quand ils sont chargés
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      setHasChanges(true);
    }
  }, [settings]);

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsService.updateSystemSettings(settings);
      setHasChanges(false);
      toast({ title: 'Succès', description: 'Paramètres sauvegardés avec succès' });
    } catch (error) {
      toast({ 
        title: 'Erreur', 
        description: error.message || 'Erreur lors de la sauvegarde',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await settingsService.resetToDefaults();
      const defaultSettings = await settingsService.getSystemSettings();
      setSettings(defaultSettings);
      setHasChanges(false);
      toast({ title: 'Réinitialisation', description: 'Paramètres réinitialisés aux valeurs par défaut' });
    } catch (error) {
      toast({ 
        title: 'Erreur', 
        description: error.message || 'Erreur lors de la réinitialisation',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!settings || Object.keys(settings).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erreur lors du chargement des paramètres</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Paramètres Système</h1>
          <p className="text-gray-600">Configurez votre marketplace</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? 'Sauvegarde...' : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">Modifications non sauvegardées</span>
          </div>
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Informations du site</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom du site</Label>
                  <Input
                    value={settings.general.siteName}
                    onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email de contact</Label>
                  <Input
                    value={settings.general.contactEmail}
                    onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fuseau horaire</Label>
                  <Select value={settings.general.timezone} onValueChange={(value) => handleSettingChange('general', 'timezone', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Dakar">Dakar (GMT+0)</SelectItem>
                      <SelectItem value="Africa/Lagos">Lagos (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Devise</Label>
                  <Select value={settings.general.currency} onValueChange={(value) => handleSettingChange('general', 'currency', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XOF">XOF (Franc CFA)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Thème et apparence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Thème</Label>
                  <Select value={settings.appearance.theme} onValueChange={(value) => handleSettingChange('appearance', 'theme', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Couleur principale</Label>
                  <Input
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => handleSettingChange('appearance', 'primaryColor', e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-gray-500">Envoyer des notifications par email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications push</Label>
                    <p className="text-sm text-gray-500">Notifications push dans le navigateur</p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité et authentification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vérification email obligatoire</Label>
                    <p className="text-sm text-gray-500">Les utilisateurs doivent vérifier leur email</p>
                  </div>
                  <Switch
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked) => handleSettingChange('security', 'requireEmailVerification', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Activer le captcha</Label>
                    <p className="text-sm text-gray-500">Protection contre les bots</p>
                  </div>
                  <Switch
                    checked={settings.security.enableCaptcha}
                    onCheckedChange={(checked) => handleSettingChange('security', 'enableCaptcha', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
