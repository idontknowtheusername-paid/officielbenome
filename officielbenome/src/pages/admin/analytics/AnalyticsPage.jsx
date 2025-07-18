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
  getAnalyticsData,
  getRevenueData,
  getUserAcquisitionData,
  getTopProducts,
  getTrafficSources,
  getSalesByCategory
} from '@/lib/api';
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

export function AnalyticsPage() {
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
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['analytics', 'overview', startDate, endDate],
    queryFn: () => getAnalyticsData({ startDate, endDate })
  });

  // Fetch revenue data
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['analytics', 'revenue', startDate, endDate],
    queryFn: () => getRevenueData({ startDate, endDate, groupBy: dateRange === 'today' || dateRange === 'yesterday' ? 'hour' : 'day' })
  });

  // Fetch user acquisition data
  const { data: userData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['analytics', 'users', startDate, endDate],
    queryFn: () => getUserAcquisitionData({ startDate, endDate })
  });

  // Fetch top products
  const { data: topProducts, isLoading: isLoadingTopProducts } = useQuery({
    queryKey: ['analytics', 'top-products', startDate, endDate],
    queryFn: () => getTopProducts({ startDate, endDate, limit: 5 })
  });

  // Fetch traffic sources
  const { data: trafficSources, isLoading: isLoadingTraffic } = useQuery({
    queryKey: ['analytics', 'traffic', startDate, endDate],
    queryFn: () => getTrafficSources({ startDate, endDate })
  });

  // Fetch sales by category
  const { data: salesByCategory, isLoading: isLoadingSalesByCategory } = useQuery({
    queryKey: ['analytics', 'categories', startDate, endDate],
    queryFn: () => getSalesByCategory({ startDate, endDate })
  });

  // Format revenue data for charts
  const formattedRevenueData = useMemo(() => {
    if (!revenueData) return [];
    
    return revenueData.map(item => ({
      date: format(parseISO(item.date), dateRange === 'today' || dateRange === 'yesterday' ? 'HH:mm' : 'MMM d'),
      revenue: item.revenue,
      orders: item.orders,
      averageOrderValue: item.averageOrderValue
    }));
  }, [revenueData, dateRange]);

  // Format user data for charts
  const formattedUserData = useMemo(() => {
    if (!userData) return [];
    
    return userData.map(item => ({
      date: format(parseISO(item.date), 'MMM d'),
      newUsers: item.newUsers,
      activeUsers: item.activeUsers,
      returningUsers: item.returningUsers
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

  // Format sales by category for pie chart
  const formattedCategoryData = useMemo(() => {
    if (!salesByCategory) return [];
    
    return Object.entries(salesByCategory).map(([name, value]) => ({
      name,
      value
    }));
  }, [salesByCategory]);

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
                   isLoadingTopProducts || isLoadingTraffic || isLoadingSalesByCategory;

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
              Chiffre d'affaires
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `$${analyticsData?.revenue?.current?.toLocaleString() || 0}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {!isLoading && analyticsData?.revenue && (
                <span className={analyticsData.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {analyticsData.revenue.change >= 0 ? '↑' : '↓'} {Math.abs(analyticsData.revenue.change)}% vs période précédente
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Commandes
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : analyticsData?.orders?.current?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {!isLoading && analyticsData?.orders && (
                <span className={analyticsData.orders.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {analyticsData.orders.change >= 0 ? '↑' : '↓'} {Math.abs(analyticsData.orders.change)}% vs période précédente
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Utilisateurs actifs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : analyticsData?.activeUsers?.current?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {!isLoading && analyticsData?.activeUsers && (
                <span className={analyticsData.activeUsers.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {analyticsData.activeUsers.change >= 0 ? '↑' : '↓'} {Math.abs(analyticsData.activeUsers.change)}% vs période précédente
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Panier moyen
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `$${analyticsData?.averageOrderValue?.current?.toLocaleString() || 0}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {!isLoading && analyticsData?.averageOrderValue && (
                <span className={analyticsData.averageOrderValue.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {analyticsData.averageOrderValue.change >= 0 ? '↑' : '↓'} {Math.abs(analyticsData.averageOrderValue.change)}% vs période précédente
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Aperçu du chiffre d'affaires</CardTitle>
            <CardDescription>
              Évolution du chiffre d'affaires sur la période sélectionnée
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={formattedRevenueData}
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
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? `$${value}` : value,
                      name === 'revenue' ? 'Chiffre d\'affaires' : 'Commandes'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#82ca9d" 
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
                  <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
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
            <CardTitle>Ventes par catégorie</CardTitle>
            <CardDescription>
              Répartition des ventes par catégorie de produits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {formattedCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      `$${value}`,
                      name
                    ]}
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
