import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { userService, listingService, transactionService } from './index.js';

// ============================================================================
// SERVICE ANALYTICS
// ============================================================================

export const analyticsService = {
  // Obtenir les statistiques generales
  getDashboardStats: async () => {
    const [users, listings, transactions] = await Promise.all([
      userService.getAllUsers(),
      listingService.getAllListings(),
      transactionService.getAllTransactions()
    ]);

    const activeUsers = users.filter(u => u.status === 'active').length;
    const pendingListings = listings.filter(l => l.status === 'pending').length;
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      users: {
        total: users.length,
        active: activeUsers,
        inactive: users.length - activeUsers
      },
      listings: {
        total: listings.length,
        approved: listings.filter(l => l.status === 'approved').length,
        pending: pendingListings,
        rejected: listings.filter(l => l.status === 'rejected').length
      },
      transactions: {
        total: transactions.length,
        completed: completedTransactions.length,
        pending: transactions.filter(t => t.status === 'pending').length,
        revenue: totalRevenue
      }
    };
  },

  // Obtenir les donnees de croissance utilisateurs
  getUserGrowthData: async (days = 30) => {
    const users = await userService.getAllUsers();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentUsers = users.filter(user => 
      new Date(user.created_at) >= cutoffDate
    );

    // Grouper par jour
    const dailyData = {};
    recentUsers.forEach(user => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + 1;
    });

    return Object.entries(dailyData).map(([date, count]) => ({
      date,
      users: count
    }));
  },

  // Obtenir les donnees de revenus
  getRevenueData: async (days = 30) => {
    const transactions = await transactionService.getAllTransactions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentTransactions = transactions.filter(transaction => 
      transaction.status === 'completed' && 
      new Date(transaction.created_at) >= cutoffDate
    );

    // Grouper par jour
    const dailyData = {};
    recentTransactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { revenue: 0, count: 0 };
      }
      dailyData[date].revenue += transaction.amount || 0;
      dailyData[date].count += 1;
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      transactions: data.count
    }));
  }
};
