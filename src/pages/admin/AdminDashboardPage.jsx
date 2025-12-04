import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, ListChecks, BarChart2, AlertTriangle, Settings, 
  ShieldCheck, ShoppingBag, Car, Briefcase, TrendingUp, 
  MessageSquare as MessageSquareWarning, DollarSign, PackageCheck, Loader2, AlertCircle, Mail
} from 'lucide-react';
import { 
  listingService,
  userService,
  notificationService
} from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminDashboardPage = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: "Utilisateurs Inscrits", value: "-", icon: <Users className="h-8 w-8 text-blue-400" />, trend: "Chargement...", color: "blue", key: 'totalUsers' },
    { title: "Annonces en Attente", value: "-", icon: <ListChecks className="h-8 w-8 text-yellow-400" />, trend: "Chargement...", color: "yellow", key: 'pendingListings' },
    { title: "Revenus (30j)", value: "-", icon: <DollarSign className="h-8 w-8 text-green-400" />, trend: "Chargement...", color: "green", key: 'revenue' },
    { title: "Activités Récentes", value: "-", icon: <MessageSquareWarning className="h-8 w-8 text-red-400" />, trend: "Chargement...", color: "red", key: 'recentActivities' },
  ]);

  const [additionalStats, setAdditionalStats] = useState([
    { title: "Visiteurs en Ligne", value: "-", icon: <Users className="h-8 w-8 text-green-400" />, trend: "Chargement...", color: "green", key: 'onlineUsers' },
    { title: "Vues (7 jours)", value: "-", icon: <TrendingUp className="h-8 w-8 text-purple-400" />, trend: "Chargement...", color: "purple", key: 'weeklyVisits' },
    { title: "Vues (30 jours)", value: "-", icon: <BarChart2 className="h-8 w-8 text-indigo-400" />, trend: "Chargement...", color: "indigo", key: 'monthlyVisits' },
    { title: "Croissance", value: "-", icon: <TrendingUp className="h-8 w-8 text-orange-400" />, trend: "Chargement...", color: "orange", key: 'conversionRate' },
  ]);
  const [recentActivities, setRecentActivities] = useState([]);

  const [quickActions] = useState([
    { label: "Gérer les Annonces", icon: <ListChecks className="mr-3 h-5 w-5" />, color: "blue", link: "/admin/listings" },
    { label: "Gérer les Utilisateurs", icon: <Users className="mr-3 h-5 w-5" />, color: "green", link: "/admin/users" },
    { label: "Newsletter", icon: <Mail className="mr-3 h-5 w-5" />, color: "orange", link: "/admin/newsletter" },
    { label: "Voir les Transactions", icon: <DollarSign className="mr-3 h-5 w-5" />, color: "purple", link: "/admin/transactions" },
    { label: "Statistiques Détaillées", icon: <BarChart2 className="mr-3 h-5 w-5" />, color: "teal", link: "/admin/analytics" },
  ]);

  useEffect(() => {
    // Le AdminLayout gère déjà l'autorisation, on charge juste les données
    const loadData = async () => {
      try {
        setIsAuthorized(true);
        await fetchDashboardData();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []); // Exécuter une seule fois au montage

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Début du chargement des données du tableau de bord...');
      
      // Recuperer les donnees en parallele avec gestion d'erreur
      let listings = [];
      let users = [];
      let notifications = [];
      let transactionStats = null;
      
      try {
        const listingsResponse = await listingService.getAllListings();
        listings = listingsResponse?.data || [];
        console.log('🔍 Annonces récupérées:', listings.length);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des annonces:', error);
        listings = [];
      }
      
      try {
        users = await userService.getAllUsers();
        console.log('🔍 Utilisateurs récupérés:', users.length);

        // Filtrer les utilisateurs avec des données valides
        users = users.filter(user =>
          user &&
          user.email &&
          user.first_name &&
          user.last_name
        );
        console.log('🔍 Utilisateurs valides:', users.length);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
        console.error('Détails:', error.message, error.details);
        users = [];
      }
      
      try {
        notifications = await notificationService.getUserNotifications();
        console.log('🔍 Notifications récupérées:', notifications.length);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des notifications:', error);
        notifications = [];
      }

      // Recuperer les statistiques de transactions
      try {
        const { transactionService } = await import('@/services');
        transactionStats = await transactionService.getGlobalStats();
        console.log('🔍 Statistiques de transactions récupérées:', transactionStats);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des statistiques de transactions:', error);
        transactionStats = {
          revenue30Days: 0,
          totalRevenue: 0,
          totalTransactions: 0
        };
      }

      // Calculer les statistiques avec gestion des cas d'erreur
      const activeUsers = users.filter(user => user.status === 'active').length;
      const totalUsers = users.length;
      const pendingListings = listings.filter(listing => listing.status === 'pending').length;
      const totalListings = listings.length;
      const recentNotifications = notifications.slice(0, 5);
      
      console.log('🔍 Statistiques calculées:', {
        activeUsers,
        totalUsers,
        pendingListings,
        totalListings,
        recentNotifications: recentNotifications.length,
        revenue30Days: transactionStats?.revenue30Days || 0
      });
      
      // Mettre a jour les statistiques principales
      setStats(prevStats => prevStats.map(stat => {
        if (stat.key === 'totalUsers') {
          return { ...stat, value: totalUsers.toLocaleString(), trend: `Actifs: ${activeUsers}` };
        } else if (stat.key === 'pendingListings') {
          return { ...stat, value: pendingListings.toString(), trend: `Total: ${totalListings}` };
        } else if (stat.key === 'revenue') {
          const revenue = transactionStats?.revenue30Days || 0;
          const formattedRevenue = new Intl.NumberFormat('fr-FR', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(revenue);
          return { ...stat, value: `${formattedRevenue} XOF`, trend: 'Revenus des 30 derniers jours' };
        } else if (stat.key === 'recentActivities') {
          return { ...stat, value: recentNotifications.length.toString(), trend: 'Dernières activités' };
        }
        return stat;
      }));

      // Calculer les statistiques additionnelles
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // VRAIES STATISTIQUES (pas d'estimations)
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // 1. Visiteurs en ligne RÉELS (connectés dans les 5 dernières minutes)
      const onlineUsers = users.filter(u =>
        u.last_sign_in_at && new Date(u.last_sign_in_at) >= fiveMinutesAgo
      ).length;

      // 2. Nouvelles inscriptions cette semaine
      const weeklySignups = users.filter(u =>
        new Date(u.created_at) >= sevenDaysAgo
      ).length;

      // 3. Nouvelles inscriptions ce mois
      const monthlySignups = users.filter(u =>
        new Date(u.created_at) >= thirtyDaysAgo
      ).length;

      // 4. Vues d'annonces RÉELLES (basé sur le champ views)
      const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
      const weeklyViews = listings
        .filter(l => new Date(l.created_at) >= sevenDaysAgo)
        .reduce((sum, l) => sum + (l.views || 0), 0);
      const monthlyViews = listings
        .filter(l => new Date(l.created_at) >= thirtyDaysAgo)
        .reduce((sum, l) => sum + (l.views || 0), 0);

      // 5. Taux de croissance mensuel des inscriptions (plus pertinent que conversion)
      const previousMonthStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const previousMonthSignups = users.filter(u =>
        new Date(u.created_at) >= previousMonthStart && new Date(u.created_at) < thirtyDaysAgo
      ).length;
      const growthRate = previousMonthSignups > 0
        ? (((monthlySignups - previousMonthSignups) / previousMonthSignups) * 100).toFixed(1)
        : monthlySignups > 0 ? 100 : 0;

      setAdditionalStats(prevStats => prevStats.map(stat => {
        if (stat.key === 'onlineUsers') {
          return {
            ...stat,
            value: onlineUsers.toString(),
            trend: onlineUsers > 0 ? 'En ligne maintenant' : 'Aucun visiteur actif'
          };
        } else if (stat.key === 'weeklyVisits') {
          return {
            ...stat,
            value: weeklyViews.toLocaleString('fr-FR'),
            trend: `${weeklySignups} nouvelles inscriptions`
          };
        } else if (stat.key === 'monthlyVisits') {
          return {
            ...stat,
            value: monthlyViews.toLocaleString('fr-FR'),
            trend: `${monthlySignups} nouvelles inscriptions`
          };
        } else if (stat.key === 'conversionRate') {
          const sign = growthRate >= 0 ? '+' : '';
          return {
            ...stat,
            value: `${sign}${growthRate}%`,
            trend: `Croissance mensuelle (${monthlySignups} ce mois)`
          };
        }
        return stat;
      }));

      // Mettre a jour les activites recentes
      const formattedActivities = recentNotifications.map(notification => ({
        id: notification.id || `notif-${Date.now()}`,
        type: notification.type || 'Notification',
        item: notification.title || notification.message || 'Nouvelle activité',
        timestamp: notification.created_at,
        status: notification.read ? 'read' : 'unread'
      }));

      setRecentActivities(formattedActivities);
      console.log('✅ Données du tableau de bord chargées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données du tableau de bord:', error);
      toast.error('Erreur lors du chargement des données');
      
      // En cas d'erreur, afficher des données par défaut
      setStats(prevStats => prevStats.map(stat => {
        if (stat.key === 'activeUsers') {
          return { ...stat, value: '0', trend: 'Erreur de chargement' };
        } else if (stat.key === 'pendingListings') {
          return { ...stat, value: '0', trend: 'Erreur de chargement' };
        } else if (stat.key === 'revenue') {
          return { ...stat, value: '0 FCFA', trend: 'Erreur de chargement' };
        } else if (stat.key === 'recentActivities') {
          return { ...stat, value: '0', trend: 'Erreur de chargement' };
        }
        return stat;
      }));
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès refusé</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          </p>
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }




  const getIconForActivity = (category, status) => {
    if (status === "Approuvée" || status === "Complétée" || status.startsWith("VIP")) return <PackageCheck className="h-5 w-5 text-green-400" />;
    if (status === "En attente KYC" || status === "En cours d'examen") return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    
    switch(category) {
      case "Immobilier": return <ListChecks className="h-5 w-5 text-blue-400" />;
      case "Automobile": return <Car className="h-5 w-5 text-red-400" />;
      case "Services": return <Briefcase className="h-5 w-5 text-purple-400" />;
      case "Marketplace": return <ShoppingBag className="h-5 w-5 text-yellow-400" />;
      case "Utilisateur": return <Users className="h-5 w-5 text-teal-400" />;
      default: return <ShieldCheck className="h-5 w-5 text-gray-400" />;
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100 p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Tableau de Bord Administrateur <span className="gradient-text">MaxiMarket</span></h1>
        <p className="text-md sm:text-lg text-slate-400">Vue d'ensemble et gestion de la marketplace.</p>
      </motion.div>

      {/* Stats Cards Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700 hover:border-${stat.color}-500 transition-colors`}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-md font-semibold text-slate-300">{stat.title}</h2>
              {stat.icon}
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <p className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</p>
                <div className="flex items-center text-xs text-slate-400">
                  <TrendingUp className={`mr-1 h-4 w-4 text-${stat.color}-400`} />
                  {stat.trend}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Stats Cards Additionnelles - Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {additionalStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            className={`bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700 hover:border-${stat.color}-500 transition-colors`}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-md font-semibold text-slate-300">{stat.title}</h2>
              {stat.icon}
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <p className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</p>
                <div className="flex items-center text-xs text-slate-400">
                  <TrendingUp className={`mr-1 h-4 w-4 text-${stat.color}-400`} />
                  {stat.trend}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-1 bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700"
        >
          <h2 className="text-xl font-semibold mb-6">Actions Rapides</h2>
          <div className="space-y-3">
            {quickActions.map(action => (
              <a 
                key={action.label} 
                href={action.link}
                className={`w-full flex items-center justify-start p-3 bg-${action.color}-600/10 hover:bg-${action.color}-600/20 text-${action.color}-300 rounded-lg transition-colors`}
              >
                {action.icon} {action.label}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity Placeholder */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700"
        >
          <h2 className="text-xl font-semibold mb-6">Activité Récente</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start p-3 bg-slate-700/50 rounded-lg">
                  <div className={`p-2 bg-${activity.status === "Approuvée" || activity.status === "Complétée" || activity.status.startsWith("VIP") ? 'green' : (activity.status === "En attente KYC" || activity.status === "En cours d'examen" ? 'yellow' : 'slate')}-600/30 rounded-full mr-3`}>
                    {getIconForActivity(activity.category, activity.status)}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-slate-200 text-sm">
                      <span className="font-bold">{activity.type}:</span> {activity.item} 
                      {activity.value && <span className="text-green-400"> ({activity.value})</span>}
                    </p>
                    <p className="text-xs text-slate-400">
                      {activity.timestamp ? formatTimeAgo(activity.timestamp) : 'Récemment'} - <span className={`font-semibold text-${activity.status === "read" ? 'green' : 'yellow'}-400`}>{activity.status === 'read' ? 'Lu' : 'Non lu'}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                {loading ? 'Chargement des activités...' : 'Aucune activité récente à afficher'}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;