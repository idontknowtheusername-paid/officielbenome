import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Payment from '../models/Payment.js';
import logger from '../config/logger.js';

/**
 * Récupère les statistiques du tableau de bord admin
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalListings,
      pendingListings,
      totalRevenue,
      recentPayments,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'pending' }),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .populate('listing', 'title'),
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers },
        listings: { total: totalListings, pending: pendingListings },
        revenue: totalRevenue[0]?.total || 0,
        recentActivities: recentPayments,
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques',
    });
  }
};

/**
 * Liste des utilisateurs avec pagination et filtres
 */
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des utilisateurs',
    });
  }
};

/**
 * Met à jour le statut d'un utilisateur
 */
export const updateUserStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { userId } = req.params;
    const { status, reason } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { status, statusReason: reason },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }

    // Envoyer une notification à l'utilisateur
    await sendNotification(user._id, {
      title: 'Statut de votre compte mis à jour',
      message: `Votre compte a été marqué comme ${status}. ${reason || ''}`,
      type: 'account_status',
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du statut utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du statut utilisateur',
    });
  }
};

/**
 * Récupère la liste des annonces avec pagination et filtres
 */
export const getListings = async (req, res) => {
  try {
    const { status = 'PENDING_APPROVAL', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { status };
    
    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Listing.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: listings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des annonces:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des annonces',
    });
  }
};

/**
 * Approuve une annonce
 */
export const approveListing = async (req, res) => {
  try {
    const { id } = req.params;
    
    const listing = await Listing.findByIdAndUpdate(
      id,
      { 
        status: 'APPROVED',
        approvedAt: new Date(),
        $unset: { rejectionReason: 1 } // Supprimer la raison de rejet si elle existe
      },
      { new: true, runValidators: true }
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Annonce non trouvée',
      });
    }

    // Envoyer une notification au propriétaire de l'annonce
    await sendNotification(listing.user, {
      title: 'Annonce approuvée',
      message: `Votre annonce "${listing.title}" a été approuvée et est maintenant visible par les utilisateurs.`,
      type: 'listing_approved',
    });

    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    logger.error('Erreur lors de l\'approbation de l\'annonce:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'approbation de l\'annonce',
    });
  }
};

/**
 * Rejette une annonce
 */
export const rejectListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const listing = await Listing.findByIdAndUpdate(
      id,
      { 
        status: 'REJECTED',
        rejectionReason: reason,
        rejectedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Annonce non trouvée',
      });
    }

    // Envoyer une notification au propriétaire de l'annonce
    await sendNotification(listing.user, {
      title: 'Annonce rejetée',
      message: `Votre annonce "${listing.title}" a été rejetée. Raison: ${reason}`,
      type: 'listing_rejected',
    });

    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    logger.error('Erreur lors du rejet de l\'annonce:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du rejet de l\'annonce',
    });
  }
};

/**
 * Récupère la liste des transactions avec pagination et filtres
 */
export const getTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (status) query.status = status;
    
    const [transactions, total] = await Promise.all([
      Payment.find(query)
        .populate('user', 'name email')
        .populate('listing', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Payment.countDocuments(query),
    ]);

    // Calculer les statistiques de revenus
    const revenueStats = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        stats: revenueStats[0] || { totalRevenue: 0, count: 0, averageAmount: 0 }
      },
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des transactions',
    });
  }
};

// Fonction utilitaire pour envoyer des notifications
async function sendNotification(userId, notification) {
  try {
    // Ici, vous pouvez implémenter l'envoi de notification via:
    // - WebSocket pour les notifications en temps réel
    // - Email
    // - Notification push
    // - Enregistrement dans la base de données pour une notification in-app
    
    // Exemple basique d'implémentation avec enregistrement en base
    const newNotification = new Notification({
      user: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: false
    });
    
    await newNotification.save();
    
    // Émettre un événement WebSocket si nécessaire
    // io.to(`user_${userId}`).emit('new_notification', newNotification);
    
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de la notification:', error);
    // Ne pas échouer la requête principale à cause d'une erreur de notification
  }
}
