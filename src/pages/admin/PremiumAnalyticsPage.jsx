import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BarChart3,
  Calendar,
  Target,
  Award,
  Zap,
  Star,
  Download,
  Filter,
  Eye,
  Heart,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { analyticsService, paymentService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PremiumAnalyticsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [paymentAnalytics, setPaymentAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [metric, setMetric] = useState('revenue');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminAnalytics();
    }
  }, [user, period, metric]);

  const loadAdminAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [boostData, paymentData, trendsData, insightsData] = await Promise.all([
        analyticsService.getBoostAnalytics(null, period),
        paymentService.getPaymentStats(),
        analyticsService.getPerformanceTrends(period, metric),
        analyticsService.getInsightsAndRecommendations()
      ]);

      setAnalytics(boostData);
      setPaymentAnalytics(paymentData);
      setTrends(trendsData);
      setInsights(insightsData);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des analytics');
      console.error('Erreur analytics admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const handleExportData = () => {
    // Simulation d'export des données
    const data = {
      analytics,
      paymentAnalytics,
      trends,
      insights,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maximarket-analytics-${period}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
          <p className="text-muted-foreground mb-6">
            Vous devez être administrateur pour accéder à cette page.
          </p>
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={loadAdminAnalytics} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec contrôles */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                📊 Analytics Premium - Admin
              </h1>
              <p className="text-muted-foreground text-lg">
                Tableau de bord complet pour la monétisation et les performances
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleExportData}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                  <SelectItem value="90d">90 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Métriques principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenus totaux</p>
                    <p className="text-2xl font-bold">
                      {analytics ? formatCurrency(analytics.totalRevenue) : '0 FCFA'}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Boosts actifs</p>
                    <p className="text-2xl font-bold">
                      {analytics ? formatNumber(analytics.activeBoosts) : '0'}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux de succès</p>
                    <p className="text-2xl font-bold">
                      {analytics ? `${analytics.successRate}%` : '0%'}
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Paiements</p>
                    <p className="text-2xl font-bold">
                      {paymentAnalytics ? formatNumber(paymentAnalytics.totalPayments) : '0'}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Graphique des tendances */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Tendances de performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trends && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Période : {period === '7d' ? '7 jours' : period === '30d' ? '30 jours' : '90 jours'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Évolution :</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(trends.trend)}
                        <span className={`text-sm font-medium ${getTrendColor(trends.trend)}`}>
                          {trends.percentageChange}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Graphique simple */}
                  <div className="h-32 flex items-end gap-2">
                    {trends.data.map((value, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-primary/20 rounded-t"
                        style={{ height: `${(value / Math.max(...trends.data)) * 100}%` }}
                      />
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {trends.labels.map((label, index) => (
                      <span key={index}>{label}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Analytics détaillés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Analytics des paiements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Analytics des paiements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentAnalytics && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(paymentAnalytics.totalAmount)}
                        </div>
                        <p className="text-sm text-blue-600">Montant total</p>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {paymentAnalytics.successRate}%
                        </div>
                        <p className="text-sm text-green-600">Taux de succès</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Paiements complétés :</span>
                        <span className="font-medium">{paymentAnalytics.completedPayments}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>En attente :</span>
                        <span className="font-medium">{paymentAnalytics.pendingPayments}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Échoués :</span>
                        <span className="font-medium">{paymentAnalytics.failedPayments}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Remboursés :</span>
                        <span className="font-medium">{paymentAnalytics.refundedPayments}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Top des catégories */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Catégories performantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics && (
                  <div className="space-y-3">
                    {analytics.topPerformingCategories.map((category, index) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {index + 1}
                          </div>
                          <span className="font-medium">{category}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Top {index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Insights et recommandations business */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Insights Business & Recommandations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-green-700 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Insights Business
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {insights.insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-muted-foreground">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-blue-700 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Recommandations Stratégiques
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {insights.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-muted-foreground">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Métriques de performance détaillées */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Métriques de performance détaillées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analytics ? formatNumber(analytics.totalBoosts) : '0'}
                  </div>
                  <p className="text-sm text-blue-600 mb-2">Total des boosts</p>
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-blue-600">Tous les temps</span>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {analytics ? formatCurrency(analytics.averageBoostPrice) : '0'}
                  </div>
                  <p className="text-sm text-green-600 mb-2">Prix moyen</p>
                  <div className="flex items-center justify-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">Par boost</span>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {analytics ? `${analytics.successRate}%` : '0%'}
                  </div>
                  <p className="text-sm text-purple-600 mb-2">Taux de succès</p>
                  <div className="flex items-center justify-center gap-1">
                    <Award className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-purple-600">Performance</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumAnalyticsPage;
