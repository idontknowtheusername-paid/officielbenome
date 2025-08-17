import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  Users, 
  DollarSign,
  BarChart3,
  Calendar,
  Target,
  Award,
  Zap,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { analyticsService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';

const PremiumAnalytics = ({ userId = null, className = '' }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [trends, setTrends] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [metric, setMetric] = useState('revenue');

  useEffect(() => {
    if (user || userId) {
      loadAnalytics();
    }
  }, [user, userId, period, metric]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [boostData, performanceData, trendsData, insightsData] = await Promise.all([
        analyticsService.getBoostAnalytics(userId || user?.id, period),
        analyticsService.getBoostPerformance('sample-boost-id'), // À adapter selon le contexte
        analyticsService.getPerformanceTrends(period, metric),
        analyticsService.getInsightsAndRecommendations(userId || user?.id)
      ]);

      setAnalytics(boostData);
      setPerformance(performanceData);
      setTrends(trendsData);
      setInsights(insightsData);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des analytics');
      console.error('Erreur analytics:', err);
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

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadAnalytics} variant="outline">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics Premium
          </h2>
          <p className="text-muted-foreground">
            Suivez les performances de vos boosts et optimisez votre ROI
          </p>
        </div>
        
        <div className="flex gap-2">
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
          
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenus</SelectItem>
              <SelectItem value="boosts">Boosts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total des boosts</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.totalBoosts)}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Boosts actifs</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.activeBoosts)}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenus totaux</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de succès</p>
                  <p className="text-2xl font-bold">{analytics.successRate}%</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Graphique des tendances */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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

      {/* Catégories performantes et insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top des catégories */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Catégories performantes
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights et recommandations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Insights & Recommandations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-700">💡 Insights</h4>
                    <ul className="space-y-2 text-sm">
                      {insights.insights.slice(0, 2).map((insight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-muted-foreground">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-700">🚀 Recommandations</h4>
                    <ul className="space-y-2 text-sm">
                      {insights.recommendations.slice(0, 2).map((rec, index) => (
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
      </div>

      {/* Métriques de performance détaillées */}
      {performance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Métriques de performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatNumber(performance.viewsIncrease)}
                  </div>
                  <p className="text-sm text-muted-foreground">Vues supplémentaires</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-blue-600">+{performance.viewsIncrease}%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {formatNumber(performance.favoritesIncrease)}
                  </div>
                  <p className="text-sm text-muted-foreground">Favoris supplémentaires</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-600">+{performance.favoritesIncrease}%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {performance.roi}%
                  </div>
                  <p className="text-sm text-muted-foreground">ROI estimé</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">Excellent</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default PremiumAnalytics;
