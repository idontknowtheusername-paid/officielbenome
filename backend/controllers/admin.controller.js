import { StatusCodes } from 'http-status-codes';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import User from '../models/User.js';
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
    ] = await Promise.all([
      User.count(),
      User.count({ where: { status: 'active' } }),
      // Note: Listing et Payment ne sont pas encore convertis, on les commente temporairement
      // Listing.count(),
      // Listing.count({ where: { status: 'pending' } }),
      // Payment.sum('amount', { where: { status: 'completed' } }),
      // Payment.findAll({
      //   order: [['createdAt', 'DESC']],
      //   limit: 5,
      //   include: [
      //     { model: User, as: 'user', attributes: ['name', 'email'] },
      //     { model: Listing, as: 'listing', attributes: ['title'] }
      //   ]
      // })
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers },
        listings: { total: 0, pending: 0 }, // Temporaire
        revenue: 0, // Temporaire
        recentActivities: [], // Temporaire
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
    const offset = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { userId } = req.params;
    const { status, reason } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }

    await user.update({ status, statusReason: reason });

    // Envoyer une notification à l'utilisateur (à implémenter)
    // await sendNotification(user.id, {
    //   title: 'Statut de votre compte mis à jour',
    //   message: `Votre compte a été marqué comme ${status}. ${reason || ''}`,
    //   type: 'account_status',
    // });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du statut utilisateur:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
    // Note: Listing n'est pas encore converti, on retourne un tableau vide temporairement
    res.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        page: parseInt(req.query.page || 1),
        pages: 0,
        limit: parseInt(req.query.limit || 20),
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des annonces:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
    // Note: Listing n'est pas encore converti
    res.status(StatusCodes.NOT_IMPLEMENTED).json({
      success: false,
      error: 'Fonctionnalité non encore implémentée',
    });
  } catch (error) {
    logger.error('Erreur lors de l\'approbation de l\'annonce:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
    // Note: Listing n'est pas encore converti
    res.status(StatusCodes.NOT_IMPLEMENTED).json({
      success: false,
      error: 'Fonctionnalité non encore implémentée',
    });
  } catch (error) {
    logger.error('Erreur lors du rejet de l\'annonce:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
    // Note: Payment n'est pas encore converti, on retourne un tableau vide temporairement
    res.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        page: parseInt(req.query.page || 1),
        pages: 0,
        limit: parseInt(req.query.limit || 20),
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des transactions:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Erreur lors de la récupération des transactions',
    });
  }
};

/**
 * Fonction utilitaire pour envoyer des notifications
 */
async function sendNotification(userId, notification) {
  try {
    // Note: Notification est converti mais la fonction n'est pas encore implémentée
    logger.info(`Notification pour l'utilisateur ${userId}:`, notification);
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de la notification:', error);
  }
}
