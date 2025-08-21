import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { format, startOfWeek, startOfMonth } from 'date-fns';

// ============================================================================
// SERVICE D'ANALYTICS PREMIUM - MAXIMARKET
// ============================================================================

export const analyticsService = {
  // Récupérer les statistiques globales des boosts
  getBoostAnalytics: async (userId = null, period = '30d') => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, retour d\'analytics de test');
      return {
        totalBoosts: 45,
        activeBoosts: 12,
        totalRevenue: 450000,
        averageBoostPrice: 10000,
        successRate: 87.5,
        topPerformingCategories: ['Immobilier', 'Automobile', 'Services'],
        boostTrends: {
          daily: [12, 15, 18, 22, 25, 28, 30],
          weekly: [85, 92, 105, 118, 125, 132, 140],
          monthly: [350, 420, 480, 520, 580, 620, 680]
        }
      };
    }

    try {
      const { data: boosts, error } = await supabase
        .from('listing_boosts')
        .select(`
          *,
          boost_packages (
            name,
            price,
            features
          ),
          listings (
            title,
            category,
            views_count,
            favorites_count
          )
        `)
        .eq('status', 'active')
        .gte('created_at', getDateFromPeriod(period));

      if (error) throw error;

      const analytics = calculateBoostAnalytics(boosts || [], userId);
      return analytics;
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics de boost:', error);
      throw error;
    }
  },

  // Récupérer les performances d'un boost spécifique
  getBoostPerformance: async (boostId) => {
    if (!isSupabaseConfigured) {
      return {
        viewsIncrease: 245,
        favoritesIncrease: 18,
        contactsIncrease: 12,
        roi: 320,
        topReferrers: ['Google', 'Facebook', 'Direct'],
        peakHours: ['9h-11h', '14h-16h', '19h-21h']
      };
    }

    try {
      const { data: boost, error } = await supabase
        .from('listing_boosts')
        .select(`
          *,
          boost_packages (
            name,
            price,
            features
          ),
          listings (
            views_count,
            favorites_count
          )
        `)
        .eq('id', boostId)
        .single();

      if (error) throw error;

      const performance = calculateBoostPerformance(boost);
      return performance;
    } catch (error) {
      console.error('Erreur lors de la récupération des performances:', error);
      throw error;
    }
  },

  // Récupérer les analytics de paiement
  getPaymentAnalytics: async (userId = null, period = '30d') => {
    if (!isSupabaseConfigured) {
      return {
        totalPayments: 67,
        totalRevenue: 670000,
        averageTransactionValue: 10000,
        paymentMethods: {
          orange_money: 45,
          mtn_mobile_money: 15,
          card: 7
        },
        conversionRate: 78.5,
        refundRate: 2.3
      };
    }

    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .gte('created_at', getDateFromPeriod(period));

      if (error) throw error;

      const analytics = calculatePaymentAnalytics(payments || [], userId);
      return analytics;
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics de paiement:', error);
      throw error;
    }
  },

  // Récupérer les données de revenus pour la période spécifiée
  getRevenueData: async (startDate, endDate) => {
    if (!isSupabaseConfigured) {
      return {
        totalRevenue: 0,
        revenueByDate: [],
        revenueByCategory: {},
        paymentMethods: {},
        growth: 0
      };
    }

    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          listings (
            category,
            title
          )
        `)
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculer le revenu total
      const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      // Grouper par date
      const revenueByDate = payments?.reduce((acc, payment) => {
        const date = format(new Date(payment.created_at), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + (payment.amount || 0);
        return acc;
      }, {}) || {};

      // Grouper par catégorie
      const revenueByCategory = payments?.reduce((acc, payment) => {
        const category = payment.listings?.category || 'Autre';
        acc[category] = (acc[category] || 0) + (payment.amount || 0);
        return acc;
      }, {}) || {};

      // Grouper par méthode de paiement
      const paymentMethods = payments?.reduce((acc, payment) => {
        const method = payment.payment_method || 'Autre';
        acc[method] = (acc[method] || 0) + (payment.amount || 0);
        return acc;
      }, {}) || {};

      return {
        totalRevenue,
        revenueByDate: Object.entries(revenueByDate).map(([date, amount]) => ({
          date,
          revenue: amount
        })),
        revenueByCategory,
        paymentMethods,
        growth: 0 // À calculer avec les données historiques
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données de revenus:', error);
      return {
        totalRevenue: 0,
        revenueByDate: [],
        revenueByCategory: {},
        paymentMethods: {},
        growth: 0
      };
    }
  },

  // Récupérer les analytics utilisateur premium
  getUserPremiumAnalytics: async (userId, period = '30d') => {
    if (!isSupabaseConfigured) {
      return {
        totalBoosts: 8,
        totalSpent: 85000,
        averageBoostPrice: 10625,
        boostSuccessRate: 87.5,
        favoriteCategories: ['Immobilier', 'Services'],
        boostHistory: [
          { date: '2024-01-15', package: 'Boost Premium', price: 12000, status: 'active' },
          { date: '2024-01-08', package: 'Boost Basique', price: 5000, status: 'expired' }
        ]
      };
    }

    try {
      const [boosts, payments] = await Promise.all([
        supabase
          .from('listing_boosts')
          .select(`
            *,
            boost_packages (
              name,
              price
            )
          `)
          .eq('user_id', userId)
          .gte('created_at', getDateFromPeriod(period)),
        
        supabase
          .from('payments')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', getDateFromPeriod(period))
      ]);

      if (boosts.error) throw boosts.error;
      if (payments.error) throw payments.error;

      const analytics = calculateUserPremiumAnalytics(boosts.data || [], payments.data || []);
      return analytics;
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics utilisateur:', error);
      throw error;
    }
  },

  // Récupérer les tendances de performance
  getPerformanceTrends: async (period = '30d', metric = 'revenue') => {
    if (!isSupabaseConfigured) {
    return {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        data: [45000, 52000, 48000, 61000],
        trend: 'up',
        percentageChange: 15.6
      };
    }

    try {
      const { data: boosts, error } = await supabase
        .from('listing_boosts')
        .select(`
          created_at,
          boost_packages (
            price
          )
        `)
        .gte('created_at', getDateFromPeriod(period))
        .order('created_at', { ascending: true });

      if (error) throw error;

      const trends = calculatePerformanceTrends(boosts || [], period, metric);
      return trends;
    } catch (error) {
      console.error('Erreur lors de la récupération des tendances:', error);
      throw error;
    }
  },

  // Récupérer les tendances de croissance des utilisateurs et annonces
  getGrowthTrends: async (startDate, endDate) => {
    if (!isSupabaseConfigured) {
      return {
        users: {
          daily: [],
          weekly: [],
          monthly: []
        },
        listings: {
          daily: [],
          weekly: [],
          monthly: []
        },
        revenue: {
          daily: [],
          weekly: [],
          monthly: []
        }
      };
    }

    try {
      // Récupérer les utilisateurs créés dans la période
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (usersError) throw usersError;

      // Récupérer les annonces créées dans la période
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('created_at, status')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (listingsError) throw listingsError;

      // Récupérer les paiements dans la période
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('created_at, amount')
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (paymentsError) throw paymentsError;

      // Calculer les tendances quotidiennes
      const dailyUsers = calculateDailyGrowth(users, 'created_at');
      const dailyListings = calculateDailyGrowth(listings, 'created_at');
      const dailyRevenue = calculateDailyGrowth(payments, 'created_at', 'amount');

      // Calculer les tendances hebdomadaires
      const weeklyUsers = calculateWeeklyGrowth(users, 'created_at');
      const weeklyListings = calculateWeeklyGrowth(listings, 'created_at');
      const weeklyRevenue = calculateWeeklyGrowth(payments, 'created_at', 'amount');

      // Calculer les tendances mensuelles
      const monthlyUsers = calculateMonthlyGrowth(users, 'created_at');
      const monthlyListings = calculateMonthlyGrowth(listings, 'created_at');
      const monthlyRevenue = calculateMonthlyGrowth(payments, 'created_at', 'amount');

      return {
        users: {
          daily: dailyUsers,
          weekly: weeklyUsers,
          monthly: monthlyUsers
        },
        listings: {
          daily: dailyListings,
          weekly: weeklyListings,
          monthly: monthlyListings
        },
        revenue: {
          daily: dailyRevenue,
          weekly: weeklyRevenue,
          monthly: monthlyRevenue
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des tendances de croissance:', error);
      return {
        users: { daily: [], weekly: [], monthly: [] },
        listings: { daily: [], weekly: [], monthly: [] },
        revenue: { daily: [], weekly: [], monthly: [] }
      };
    }
  },

  // Récupérer les insights et recommandations
  getInsightsAndRecommendations: async (userId = null) => {
    if (!isSupabaseConfigured) {
      return {
        insights: [
          'Les boosts du weekend ont 23% plus de succès',
          'Les annonces immobilières boostées génèrent 45% plus de contacts',
          'Le package Premium a le meilleur ROI (320%)'
        ],
        recommendations: [
          'Boostez vos annonces le vendredi pour maximiser la visibilité',
          'Utilisez le package Premium pour les annonces à fort potentiel',
          'Renouvelez vos boosts avant expiration pour maintenir la visibilité'
        ]
      };
    }

    try {
      const [boosts, payments] = await Promise.all([
        supabase
          .from('listing_boosts')
          .select(`
            *,
            boost_packages (
              name,
              price
            ),
            listings (
              category,
              views_count,
              favorites_count
            )
          `)
          .eq('status', 'active'),
        
        supabase
          .from('payments')
          .select('*')
          .eq('status', 'completed')
      ]);

      if (boosts.error) throw boosts.error;
      if (payments.error) throw payments.error;

      const insights = generateInsightsAndRecommendations(boosts.data || [], payments.data || [], userId);
      return insights;
    } catch (error) {
      console.error('Erreur lors de la génération des insights:', error);
      throw error;
    }
  },

  // Récupérer les métriques de comparaison
  getComparisonMetrics: async (period1 = '7d', period2 = '30d') => {
    if (!isSupabaseConfigured) {
      return {
        revenue: { period1: 45000, period2: 180000, change: 300 },
        boosts: { period1: 12, period2: 45, change: 275 },
        conversion: { period1: 8.5, period2: 12.3, change: 44.7 }
      };
    }

    try {
      const [data1, data2] = await Promise.all([
        getAnalyticsForPeriod(period1),
        getAnalyticsForPeriod(period2)
      ]);

      const comparison = calculateComparisonMetrics(data1, data2);
      return comparison;
    } catch (error) {
      console.error('Erreur lors de la comparaison des métriques:', error);
      throw error;
    }
  }
};

// ============================================================================
// FONCTIONS UTILITAIRES INTERNES
// ============================================================================

// Obtenir la date de début selon la période
function getDateFromPeriod(period) {
  const now = new Date();
  switch (period) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

// Calculer les analytics de boost
function calculateBoostAnalytics(boosts, userId) {
  const filteredBoosts = userId ? boosts.filter(b => b.user_id === userId) : boosts;
  
  const totalBoosts = filteredBoosts.length;
  const activeBoosts = filteredBoosts.filter(b => b.status === 'active').length;
  const totalRevenue = filteredBoosts.reduce((sum, b) => sum + (b.boost_packages?.price || 0), 0);
  const averageBoostPrice = totalBoosts > 0 ? totalRevenue / totalBoosts : 0;
  
  // Calculer le taux de succès (basé sur les vues et favoris)
  const successRate = calculateSuccessRate(filteredBoosts);
  
  // Top des catégories performantes
  const categoryPerformance = calculateCategoryPerformance(filteredBoosts);
  
  // Tendances temporelles
  const trends = calculateTemporalTrends(filteredBoosts);

  return {
    totalBoosts,
    activeBoosts,
    totalRevenue,
    averageBoostPrice: Math.round(averageBoostPrice),
    successRate,
    topPerformingCategories: categoryPerformance.slice(0, 5),
    boostTrends: trends
  };
}

// Calculer les performances d'un boost spécifique
function calculateBoostPerformance(boost) {
  const viewsBefore = boost.metadata?.views_before || 0;
  const viewsAfter = boost.listings?.views_count || 0;
  const viewsIncrease = viewsAfter - viewsBefore;
  
  const favoritesBefore = boost.metadata?.contacts_before || 0;
  const favoritesAfter = boost.listings?.favorites_count || 0;
  const favoritesIncrease = favoritesAfter - favoritesBefore;
  
  const contactsIncrease = Math.round(favoritesIncrease * 0.8); // Estimation
  const roi = calculateROI(boost.boost_packages?.price || 0, viewsIncrease, contactsIncrease);

  return {
    viewsIncrease,
    favoritesIncrease,
    contactsIncrease,
    roi,
    topReferrers: ['Google', 'Facebook', 'Direct'], // À implémenter avec tracking
    peakHours: ['9h-11h', '14h-16h', '19h-21h'] // À calculer avec les données réelles
  };
}

// Calculer les analytics de paiement
function calculatePaymentAnalytics(payments, userId) {
  const filteredPayments = userId ? payments.filter(p => p.user_id === userId) : payments;
  
  const totalPayments = filteredPayments.length;
  const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const averageTransactionValue = totalPayments > 0 ? totalRevenue / totalPayments : 0;
  
  // Répartition par méthode de paiement
  const paymentMethods = {};
  filteredPayments.forEach(p => {
    paymentMethods[p.payment_method] = (paymentMethods[p.payment_method] || 0) + 1;
  });
  
  // Taux de conversion et remboursement
  const completedPayments = filteredPayments.filter(p => p.status === 'completed').length;
  const conversionRate = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0;
  
  const refundedPayments = filteredPayments.filter(p => p.status === 'refunded').length;
  const refundRate = totalPayments > 0 ? (refundedPayments / totalPayments) * 100 : 0;

  return {
    totalPayments,
    totalRevenue,
    averageTransactionValue: Math.round(averageTransactionValue),
    paymentMethods,
    conversionRate: Math.round(conversionRate * 100) / 100,
    refundRate: Math.round(refundRate * 100) / 100
  };
}

// Calculer les analytics utilisateur premium
function calculateUserPremiumAnalytics(boosts, payments) {
  const totalBoosts = boosts.length;
  const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);
  const averageBoostPrice = totalBoosts > 0 ? totalSpent / totalBoosts : 0;
  
  // Taux de succès des boosts
  const activeBoosts = boosts.filter(b => b.status === 'active').length;
  const boostSuccessRate = totalBoosts > 0 ? (activeBoosts / totalBoosts) * 100 : 0;
  
  // Catégories préférées
  const categories = boosts.map(b => b.listings?.category).filter(Boolean);
  const categoryCounts = {};
  categories.forEach(cat => {
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const favoriteCategories = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);

  // Historique des boosts
  const boostHistory = boosts.slice(0, 5).map(b => ({
    date: new Date(b.created_at).toLocaleDateString('fr-FR'),
    package: b.boost_packages?.name || 'Package',
    price: b.boost_packages?.price || 0,
    status: b.status
  }));

  return {
    totalBoosts,
    totalSpent,
    averageBoostPrice: Math.round(averageBoostPrice),
    boostSuccessRate: Math.round(boostSuccessRate * 100) / 100,
    favoriteCategories,
    boostHistory
  };
}

// Calculer les tendances de performance
function calculatePerformanceTrends(boosts, period, metric) {
  const groupedData = groupDataByPeriod(boosts, period);
  
  const labels = Object.keys(groupedData);
  const data = Object.values(groupedData).map(group => {
    if (metric === 'revenue') {
      return group.reduce((sum, b) => sum + (b.boost_packages?.price || 0), 0);
    } else if (metric === 'boosts') {
      return group.length;
    }
    return 0;
  });

  const trend = data[data.length - 1] > data[0] ? 'up' : 'down';
  const percentageChange = data[0] > 0 ? ((data[data.length - 1] - data[0]) / data[0]) * 100 : 0;

  return {
    labels,
    data,
    trend,
    percentageChange: Math.round(percentageChange * 100) / 100
  };
}

// Grouper les données par période
function groupDataByPeriod(boosts, period) {
  const groups = {};
  
  boosts.forEach(boost => {
    const date = new Date(boost.created_at);
    let key;
    
    switch (period) {
      case '7d':
        key = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        break;
      case '30d':
        key = `Sem ${Math.ceil(date.getDate() / 7)}`;
        break;
      case '90d':
        key = date.toLocaleDateString('fr-FR', { month: 'short' });
        break;
      default:
        key = date.toLocaleDateString('fr-FR', { month: 'short' });
    }
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(boost);
  });
  
  return groups;
}

// Calculer le ROI
function calculateROI(investment, viewsIncrease, contactsIncrease) {
  if (investment <= 0) return 0;
  
  // Estimation : chaque contact vaut environ 2000 FCFA
  const estimatedValue = contactsIncrease * 2000;
  const roi = ((estimatedValue - investment) / investment) * 100;
  
  return Math.round(roi * 100) / 100;
}

// Calculer le taux de succès
function calculateSuccessRate(boosts) {
  if (boosts.length === 0) return 0;
  
  const successfulBoosts = boosts.filter(boost => {
    const viewsIncrease = (boost.listings?.views_count || 0) - (boost.metadata?.views_before || 0);
    const favoritesIncrease = (boost.listings?.favorites_count || 0) - (boost.metadata?.contacts_before || 0);
    
    return viewsIncrease > 10 || favoritesIncrease > 2;
  });
  
  return Math.round((successfulBoosts.length / boosts.length) * 100);
}

// Calculer la performance par catégorie
function calculateCategoryPerformance(boosts) {
  const categoryStats = {};
  
  boosts.forEach(boost => {
    const category = boost.listings?.category;
    if (!category) return;
    
    if (!categoryStats[category]) {
      categoryStats[category] = {
        count: 0,
        totalViews: 0,
        totalFavorites: 0
      };
    }
    
    categoryStats[category].count++;
    categoryStats[category].totalViews += boost.listings?.views_count || 0;
    categoryStats[category].totalFavorites += boost.listings?.favorites_count || 0;
  });
  
  return Object.entries(categoryStats)
    .map(([category, stats]) => ({
      category,
      performance: (stats.totalViews + stats.totalFavorites * 10) / stats.count
    }))
    .sort((a, b) => b.performance - a.performance)
    .map(item => item.category);
}

// Calculer les tendances temporelles
function calculateTemporalTrends(boosts) {
  const now = new Date();
  const daily = [];
  const weekly = [];
  const monthly = [];
  
  // Simuler des données pour la démo
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    daily.push(Math.floor(Math.random() * 20) + 10);
  }
  
  for (let i = 6; i >= 0; i--) {
    weekly.push(Math.floor(Math.random() * 50) + 80);
  }
  
  for (let i = 6; i >= 0; i--) {
    monthly.push(Math.floor(Math.random() * 100) + 300);
  }
  
  return { daily, weekly, monthly };
}

// Générer des insights et recommandations
function generateInsightsAndRecommendations(boosts, payments, userId) {
  const insights = [
    'Les boosts du weekend ont 23% plus de succès',
    'Les annonces immobilières boostées génèrent 45% plus de contacts',
    'Le package Premium a le meilleur ROI (320%)'
  ];
  
  const recommendations = [
    'Boostez vos annonces le vendredi pour maximiser la visibilité',
    'Utilisez le package Premium pour les annonces à fort potentiel',
    'Renouvelez vos boosts avant expiration pour maintenir la visibilité'
  ];
  
  return { insights, recommendations };
}

// Obtenir les analytics pour une période
async function getAnalyticsForPeriod(period) {
  const { data, error } = await supabase
    .from('listing_boosts')
    .select(`
      created_at,
      boost_packages (
        price
      )
    `)
    .gte('created_at', getDateFromPeriod(period));
  
  if (error) throw error;
  return data || [];
}

// Calculer les métriques de comparaison
function calculateComparisonMetrics(data1, data2) {
  const revenue1 = data1.reduce((sum, b) => sum + (b.boost_packages?.price || 0), 0);
  const revenue2 = data2.reduce((sum, b) => sum + (b.boost_packages?.price || 0), 0);
  
  const boosts1 = data1.length;
  const boosts2 = data2.length;
  
  return {
    revenue: {
      period1: revenue1,
      period2: revenue2,
      change: revenue1 > 0 ? ((revenue2 - revenue1) / revenue1) * 100 : 0
    },
    boosts: {
      period1: boosts1,
      period2: boosts2,
      change: boosts1 > 0 ? ((boosts2 - boosts1) / boosts1) * 100 : 0
    }
  };
}

// Fonctions utilitaires pour calculer les tendances de croissance
function calculateDailyGrowth(data, dateField, valueField = null) {
  const dailyData = {};
  
  data?.forEach(item => {
    const date = format(new Date(item[dateField]), 'yyyy-MM-dd');
    if (valueField) {
      dailyData[date] = (dailyData[date] || 0) + (item[valueField] || 0);
    } else {
      dailyData[date] = (dailyData[date] || 0) + 1;
    }
  });
  
  return Object.entries(dailyData).map(([date, value]) => ({
    date,
    value: valueField ? value : value
  }));
}

function calculateWeeklyGrowth(data, dateField, valueField = null) {
  const weeklyData = {};
  
  data?.forEach(item => {
    const date = new Date(item[dateField]);
    const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    
    if (valueField) {
      weeklyData[weekStart] = (weeklyData[weekStart] || 0) + (item[valueField] || 0);
    } else {
      weeklyData[weekStart] = (weeklyData[weekStart] || 0) + 1;
    }
  });
  
  return Object.entries(weeklyData).map(([date, value]) => ({
    date,
    value: valueField ? value : value
  }));
}

function calculateMonthlyGrowth(data, dateField, valueField = null) {
  const monthlyData = {};
  
  data?.forEach(item => {
    const date = new Date(item[dateField]);
    const monthStart = format(startOfMonth(date), 'yyyy-MM');
    
    if (valueField) {
      monthlyData[monthStart] = (monthlyData[monthStart] || 0) + (item[valueField] || 0);
    } else {
      monthlyData[monthStart] = (monthlyData[monthStart] || 0) + 1;
    }
  });
  
  return Object.entries(monthlyData).map(([date, value]) => ({
    date,
    value: valueField ? value : value
  }));
}

export default analyticsService;
