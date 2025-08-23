import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { newsletterService } from '@/services/newsletter.service.js';
import { emailService } from '@/services/email.service.js';
import { campaignService } from '@/services/campaign.service.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Users, 
  BarChart3, 
  Send, 
  Plus, 
  Calendar,
  TrendingUp,
  Activity,
  Target,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

const NewsletterAdminPage = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignStats, setCampaignStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    type: 'weeklyNewsletter',
    subject: '',
    data: {},
    scheduledDate: ''
  });

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, subscribersData, campaignsData, campaignStatsData] = await Promise.all([
        newsletterService.getStats(),
        newsletterService.getStats(),
        campaignService.getAllCampaigns(),
        campaignService.getCampaignStats()
      ]);
      
      setStats(statsData);
      setSubscribers(subscribersData.data || []);
      setCampaigns(campaignsData || []);
      setCampaignStats(campaignStatsData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Envoyer une campagne
  const sendCampaign = async () => {
    try {
      setSending(true);
      
      let result;
      switch (campaignForm.type) {
        case 'weeklyNewsletter':
          result = await newsletterService.sendWeeklyNewsletter(campaignForm.data);
          break;
        case 'monthlyNewsletter':
          result = await newsletterService.sendMonthlyNewsletter(campaignForm.data);
          break;
        case 'specialOffer':
          result = await newsletterService.sendSpecialOffer(campaignForm.data);
          break;
        case 'reengagementCampaign':
          result = await newsletterService.sendReengagementCampaign(campaignForm.data);
          break;
        case 'maintenanceNotification':
          result = await newsletterService.sendMaintenanceNotification(campaignForm.data);
          break;
        default:
          throw new Error('Type de campagne non supporté');
      }

      toast({
        title: "Succès",
        description: result.message || "Campagne envoyée avec succès",
      });

      // Recharger les données
      await loadData();
      
      // Réinitialiser le formulaire
      setCampaignForm({
        type: 'weeklyNewsletter',
        subject: '',
        data: {},
        scheduledDate: ''
      });

    } catch (error) {
      console.error('Erreur envoi campagne:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'envoi de la campagne",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  // Générer des données de test
  const generateTestData = () => {
    const testData = {
      weekStart: new Date().toLocaleDateString('fr-FR'),
      newListings: Math.floor(Math.random() * 200) + 100 + '+',
      activeUsers: (Math.random() * 5 + 1).toFixed(1) + 'k',
      transactions: Math.floor(Math.random() * 100) + 50,
      newUsers: Math.floor(Math.random() * 500) + 200,
      featuredListings: [
        { id: 1, title: 'Appartement moderne', price: '150,000 €', location: 'Dakar' },
        { id: 2, title: 'Voiture d\'occasion', price: '25,000 €', location: 'Abidjan' }
      ]
    };

    setCampaignForm(prev => ({
      ...prev,
      data: testData
    }));

    toast({
      title: "Données de test générées",
      description: "Les données de test ont été ajoutées au formulaire",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            Dashboard Newsletter
          </h1>
          <p className="text-muted-foreground">
            Gérez vos campagnes email et suivez vos statistiques
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="subscribers">Abonnés</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Abonnés</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.active || 0} actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Abonnés Actifs</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.total ? Math.round((stats.active / stats.total) * 100) : 0}% du total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Abonnés Inactifs</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats?.inactive || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Désinscrits ou inactifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux d'Engagement</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.total ? Math.round((stats.active / stats.total) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Abonnés actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campagnes Envoyées</CardTitle>
                <Send className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {campaignStats?.sent || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sur {campaignStats?.total || 0} total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Graphique d'évolution */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution des abonnés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Graphique d'évolution à implémenter</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campagnes */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Créer une nouvelle campagne
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign-type">Type de campagne</Label>
                  <Select 
                    value={campaignForm.type} 
                    onValueChange={(value) => setCampaignForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weeklyNewsletter">Newsletter Hebdomadaire</SelectItem>
                      <SelectItem value="monthlyNewsletter">Newsletter Mensuelle</SelectItem>
                      <SelectItem value="specialOffer">Offre Spéciale</SelectItem>
                      <SelectItem value="reengagementCampaign">Campagne de Réengagement</SelectItem>
                      <SelectItem value="maintenanceNotification">Notification de Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scheduled-date">Date programmée (optionnel)</Label>
                  <Input
                    id="scheduled-date"
                    type="datetime-local"
                    value={campaignForm.scheduledDate}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Données spécifiques selon le type */}
              {campaignForm.type === 'weeklyNewsletter' && (
                <div className="space-y-4">
                  <h4 className="font-medium">Données de la newsletter hebdomadaire</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Début de semaine</Label>
                      <Input
                        value={campaignForm.data.weekStart || ''}
                        onChange={(e) => setCampaignForm(prev => ({
                          ...prev,
                          data: { ...prev.data, weekStart: e.target.value }
                        }))}
                        placeholder="1er janvier 2024"
                      />
                    </div>
                    <div>
                      <Label>Nouvelles annonces</Label>
                      <Input
                        value={campaignForm.data.newListings || ''}
                        onChange={(e) => setCampaignForm(prev => ({
                          ...prev,
                          data: { ...prev.data, newListings: e.target.value }
                        }))}
                        placeholder="150+"
                      />
                    </div>
                    <div>
                      <Label>Utilisateurs actifs</Label>
                      <Input
                        value={campaignForm.data.activeUsers || ''}
                        onChange={(e) => setCampaignForm(prev => ({
                          ...prev,
                          data: { ...prev.data, activeUsers: e.target.value }
                        }))}
                        placeholder="2.5k"
                      />
                    </div>
                    <div>
                      <Label>Transactions</Label>
                      <Input
                        value={campaignForm.data.transactions || ''}
                        onChange={(e) => setCampaignForm(prev => ({
                          ...prev,
                          data: { ...prev.data, transactions: e.target.value }
                        }))}
                        placeholder="89"
                      />
                    </div>
                  </div>
                </div>
              )}

              {campaignForm.type === 'specialOffer' && (
                <div className="space-y-4">
                  <h4 className="font-medium">Détails de l'offre spéciale</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Réduction</Label>
                      <Input
                        value={campaignForm.data.discount || ''}
                        onChange={(e) => setCampaignForm(prev => ({
                          ...prev,
                          data: { ...prev.data, discount: e.target.value }
                        }))}
                        placeholder="20%"
                      />
                    </div>
                    <div>
                      <Label>Code promo</Label>
                      <Input
                        value={campaignForm.data.code || ''}
                        onChange={(e) => setCampaignForm(prev => ({
                          ...prev,
                          data: { ...prev.data, code: e.target.value }
                        }))}
                        placeholder="NEWSLETTER20"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={campaignForm.data.description || ''}
                        onChange={(e) => setCampaignForm(prev => ({
                          ...prev,
                          data: { ...prev.data, description: e.target.value }
                        }))}
                        placeholder="Sur tous les services premium"
                      />
                    </div>
                    <div>
                      <Label>Date d'expiration</Label>
                      <Input
                        value={campaignForm.data.expiryDate || ''}
                        onChange={(e) => setCampaignForm(prev => ({
                          ...prev,
                          data: { ...prev.data, expiryDate: e.target.value }
                        }))}
                        placeholder="31 décembre 2024"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={generateTestData} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Générer données de test
                </Button>
                <Button 
                  onClick={sendCampaign} 
                  disabled={sending}
                  className="flex-1"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer la campagne
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Historique des campagnes */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des campagnes ({campaigns.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.length > 0 ? (
                  campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          campaign.status === 'sent' ? 'bg-green-100' :
                          campaign.status === 'draft' ? 'bg-gray-100' :
                          campaign.status === 'scheduled' ? 'bg-blue-100' :
                          campaign.status === 'sending' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          {campaign.status === 'sent' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : campaign.status === 'draft' ? (
                            <Clock className="h-4 w-4 text-gray-600" />
                          ) : campaign.status === 'scheduled' ? (
                            <Calendar className="h-4 w-4 text-blue-600" />
                          ) : campaign.status === 'sending' ? (
                            <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{campaign.subject || campaign.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {campaign.sent_at ? 
                              `Envoyée le ${new Date(campaign.sent_at).toLocaleDateString('fr-FR')}` :
                              campaign.scheduled_date ?
                              `Programmée le ${new Date(campaign.scheduled_date).toLocaleDateString('fr-FR')}` :
                              `Créée le ${new Date(campaign.created_at).toLocaleDateString('fr-FR')}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          campaign.status === 'sent' ? 'default' :
                          campaign.status === 'draft' ? 'secondary' :
                          campaign.status === 'scheduled' ? 'outline' :
                          'destructive'
                        }>
                          {campaign.status === 'sent' ? 'Envoyée' :
                           campaign.status === 'draft' ? 'Brouillon' :
                           campaign.status === 'scheduled' ? 'Programmée' :
                           campaign.status === 'sending' ? 'Envoi...' :
                           'Échec'}
                        </Badge>
                        {campaign.recipient_count > 0 && (
                          <Badge variant="secondary">{campaign.recipient_count} destinataires</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune campagne créée</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Abonnés */}
        <TabsContent value="subscribers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Liste des abonnés ({subscribers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {subscribers.map((subscriber, index) => (
                  <div key={subscriber.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{subscriber.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Inscrit le {new Date(subscriber.subscribed_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                        {subscriber.is_active ? "Actif" : "Inactif"}
                      </Badge>
                      {subscriber.source && (
                        <Badge variant="outline">{subscriber.source}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Taux d'ouverture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Newsletter hebdomadaire</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span>Offres spéciales</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span>Notifications système</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taux de clic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Newsletter hebdomadaire</span>
                    <span className="font-medium">23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span>Offres spéciales</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span>Notifications système</span>
                    <span className="font-medium">12%</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance par jour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Graphique de performance à implémenter</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsletterAdminPage;
