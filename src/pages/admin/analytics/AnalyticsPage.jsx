import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  listingService,
  userService,
  analyticsService
} from '@/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Bar, 
  BarChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, subMonths, subYears, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function AnalyticsPage() {
  // State for date range
  const [dateRange, setDateRange] = useState('7days');
  const [startDate, endDate] = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return [format(now, 'yyyy-MM-dd'), format(now, 'yyyy-MM-dd')];
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return [format(yesterday, 'yyyy-MM-dd'), format(yesterday, 'yyyy-MM-dd')];
      case '7days':
        return [format(subDays(now, 7), 'yyyy-MM-dd'), format(now, 'yyyy-MM-dd')];
      case '30days':
        return [format(subDays(now, 30), 'yyyy-MM-dd'), format(now, 'yyyy-MM-dd')];
      case '90days':
        return [format(subDays(now, 90), 'yyyy-MM-dd'), format(now, 'yyyy-MM-dd')];
      case 'thisMonth':
        return [format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd'), format(now, 'yyyy-MM-dd')];
      case 'lastMonth':
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return [format(firstDayLastMonth, 'yyyy-MM-dd'), format(lastDayLastMonth, 'yyyy-MM-dd')];
      case 'thisYear':
        return [format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd'), format(now, 'yyyy-MM-dd')];
      default:
        return [format(subDays(now, 7), 'yyyy-MM-dd'), format(now, 'yyyy-MM-dd')];
    }
  }, [dateRange]);

  // Fetch analytics data
  const { data: analyticsData, isLoading: isLoadingAnalytics, error: analyticsError } = useQuery({
    queryKey: ['analytics', 'overview', startDate, endDate],
    queryFn: async () => {
      try {
        console.log('🔍 Début du chargement des données analytics...');
        console.log('🔍 Période:', { startDate, endDate });
        
        // Recuperer les donnees de base pour les analytics
        const [listings, users] = await Promise.all([
          listingService.getAllListings(),
          userService.getAllUsers()
        ]);
        
        console.log('🔍 Données récupérées:', { 
          listingsCount: listings?.length, 
          usersCount: users?.length 
        });
        
        // Calculer les statistiques de base
        const totalListings = listings?.length || 0;
        const approvedListings = listings?.filter(l => l.status === 'approved')?.length || 0;
        const pendingListings = listings?.filter(l => l.status === 'pending')?.length || 0;
        const totalUsers = users?.length || 0;
        const activeUsers = users?.filter(u => u.status === 'active')?.length || 0;
        
        const result = {
          totalListings,
          approvedListings,
          pendingListings,
          totalUsers,
          activeUsers,
          revenue: {
            current: 0, // Sera mis à jour avec revenueData
            change: 0
          },
          orders: {
            current: 0,
            change: 0
          },
          averageOrderValue: {
            current: 0,
            change: 0
          },
          activeUsers: {
            current: activeUsers,
            change: 0
          },
          growth: {
            listings: 0,
            users: 0,
            revenue: 0
          }
        };
        
        console.log('🔍 Résultat analytics calculé:', result);
        return result;
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données analytics:', error);
        throw error;
      }
    }
  });

  // Fetch revenue data
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['analytics', 'revenue', startDate, endDate],
    queryFn: async () => {
      try {
        console.log('🔍 Début du chargement des données de revenus...');
        console.log('🔍 Période:', { startDate, endDate });
        
        const result = await analyticsService.getRevenueData(startDate, endDate);
        console.log('🔍 Données de revenus récupérées:', result);
        return result;
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données de revenus:', error);
        return {
          totalRevenue: 0,
          revenueByDate: [],
          revenueByCategory: {},
          paymentMethods: {},
          growth: 0
        };
      }
    }
  });

  // Fetch user acquisition data
  const { data: userData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['analytics', 'users', startDate, endDate],
    queryFn: async () => {
      try {
        const users = await userService.getAllUsers();
        
        // Grouper les utilisateurs par date de creation
        const userGroups = users.reduce((acc, user) => {
          if (user.created_at) {
            const date = format(new Date(user.created_at), 'yyyy-MM-dd');
            acc[date] = (acc[date] || 0) + 1;
          }
          return acc;
        }, {});
        
        return Object.entries(userGroups).map(([date, count]) => ({
          date,
          users: count
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateurs:', error);
        return [];
      }
    }
  });

  // Fetch top products
  const { data: topProducts, isLoading: isLoadingTopProducts } = useQuery({
    queryKey: ['analytics', 'top-products', startDate, endDate],
    queryFn: async () => {
      // TODO: Implementer les donnees des produits les plus vendus
      return [];
    }
  });

  // Fetch growth trends
  const { data: growthTrends, isLoading: isLoadingGrowth } = useQuery({
    queryKey: ['analytics', 'growth', startDate, endDate],
    queryFn: async () => {
      try {
        return await analyticsService.getGrowthTrends(startDate, endDate);
      } catch (error) {
        console.error('Erreur lors du chargement des tendances de croissance:', error);
        return {
          users: { daily: [], weekly: [], monthly: [] },
          listings: { daily: [], weekly: [], monthly: [] },
          revenue: { daily: [], weekly: [], monthly: [] }
        };
      }
    }
  });

  // Fetch traffic sources
  const { data: trafficSources, isLoading: isLoadingTraffic } = useQuery({
    queryKey: ['analytics', 'traffic', startDate, endDate],
    queryFn: async () => {
      // TODO: Implementer les sources de trafic
      // Retourner des données par défaut pour éviter les erreurs
      return {
        'Recherche directe': 45,
        'Réseaux sociaux': 30,
        'Moteurs de recherche': 15,
        'Liens externes': 10
      };
    }
  });

  // Fetch sales by category
  const { data: salesByCategory, isLoading: isLoadingSalesByCategory } = useQuery({
    queryKey: ['analytics', 'categories', startDate, endDate],
    queryFn: async () => {
      // TODO: Implementer les ventes par categorie
      // Retourner des données par défaut pour éviter les erreurs
      return {
        'Immobilier': 40,
        'Automobile': 25,
        'Services': 20,
        'Marketplace': 15
      };
    }
  });



  // Format user data for charts
  const formattedUserData = useMemo(() => {
    if (!userData) return [];
    
    return userData.map(item => ({
      date: format(parseISO(item.date), 'MMM d'),
      newUsers: item.users,
      activeUsers: item.users, // Assuming activeUsers is the same as newUsers for simplicity in this example
      returningUsers: 0 // No returning users data available in this simplified example
    }));
  }, [userData]);

  // Format traffic sources data for pie chart
  const formattedTrafficData = useMemo(() => {
    if (!trafficSources) return [];
    
    return Object.entries(trafficSources).map(([name, value]) => ({
      name,
      value
    }));
  }, [trafficSources]);



  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (previous === 0) return { value: 0, isPositive: current > 0 };
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return {
      value: Math.abs(Math.round(change)),
      isPositive: change >= 0
    };
  };

  // Loading state
  const isLoading = isLoadingAnalytics || isLoadingRevenue || isLoadingUsers || 
                   isLoadingTopProducts || isLoadingTraffic || isLoadingSalesByCategory || isLoadingGrowth;

  // Gestion globale des erreurs
  if (analyticsError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">
            Une erreur est survenue lors du chargement des données.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tableau de Bord Analytique</h2>
          <p className="text-muted-foreground">
            Aperçu des performances et des tendances de votre plateforme
          </p>
        </div>
        <div className="mt-4 flex items-center space-x-2 md:mt-0">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sélectionner une période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="yesterday">Hier</SelectItem>
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="30days">30 derniers jours</SelectItem>
              <SelectItem value="90days">90 derniers jours</SelectItem>
              <SelectItem value="thisMonth">Ce mois-ci</SelectItem>
              <SelectItem value="lastMonth">Le mois dernier</SelectItem>
              <SelectItem value="thisYear">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Annonces
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : analyticsData?.totalListings?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.approvedListings || 0} approuvées, {analyticsData?.pendingListings || 0} en attente
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : analyticsData?.totalUsers?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.activeUsers?.current || 0} actifs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chiffre d'affaires
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${(revenueData?.totalRevenue || 0).toLocaleString()} FCFA`}
            </div>
            <p className="text-xs text-muted-foreground">
              {revenueData?.revenueByDate?.length > 0 && (
                <span className="text-green-600">
                  ↑ {revenueData.revenueByDate.length} transactions
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux d'approbation
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : analyticsData?.totalListings ? 
                `${Math.round((analyticsData.approvedListings / analyticsData.totalListings) * 100)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.approvedListings || 0} sur {analyticsData?.totalListings || 0} annonces
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Évolution des Revenus</CardTitle>
            <CardDescription>
              Chiffre d'affaires sur la période sélectionnée
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData?.revenueByDate || []}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value.toLocaleString()} FCFA`}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Revenus']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Sources de trafic</CardTitle>
            <CardDescription>
              Répartition des sources de trafic sur votre site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedTrafficData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {formattedTrafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}%`,
                      name
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {formattedTrafficData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Activité des utilisateurs</CardTitle>
                <CardDescription>
                  Évolution des nouveaux utilisateurs et des utilisateurs actifs
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-muted-foreground">Nouveaux</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full bg-green-600"></div>
                  <span className="text-xs text-muted-foreground">Actifs</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedUserData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newUsers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="activeUsers" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Croissance des Utilisateurs</CardTitle>
            <CardDescription>
              Nouveaux utilisateurs par période
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthTrends?.users?.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => [value, 'Nouveaux utilisateurs']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#82ca9d" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Trends Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Croissance des Annonces</CardTitle>
            <CardDescription>
              Nouvelles annonces créées par période
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthTrends?.listings?.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => [value, 'Nouvelles annonces']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des Revenus par Catégorie</CardTitle>
            <CardDescription>
              Chiffre d'affaires par catégorie d'annonces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(revenueData?.revenueByCategory || {}).map(([name, value]) => ({
                      name: name === 'real_estate' ? 'Immobilier' : 
                            name === 'automobile' ? 'Automobile' : 
                            name === 'services' ? 'Services' : 
                            name === 'marketplace' ? 'Marketplace' : name,
                      value
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.entries(revenueData?.revenueByCategory || {}).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Revenus']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produits les plus vendus</CardTitle>
              <CardDescription>
                Les produits les plus populaires sur votre plateforme
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p>Chargement des produits...</p>
              </div>
            ) : topProducts?.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center">
                  <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center mr-4">
                    <span className="text-sm font-medium text-slate-700">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.category} • {product.orders} ventes
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.revenue.toLocaleString()}</p>
                    <div className="flex items-center justify-end">
                      {product.change >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${product.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(product.change)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default AnalyticsPage;