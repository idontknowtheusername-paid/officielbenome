import { StatusCodes } from 'http-status-codes';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import User from '../models/User.js';
import logger from '../config/logger.js';
import Listing from '../models/Listing.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import Report from '../models/Report.js';
import AdminSetting from '../models/AdminSetting.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import emailService from '../services/emailService.js';
import redisClient from '../config/redis.js';

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
 * Récupère les statistiques avancées (analytics)
 */
export const getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalListings, totalTransactions, totalReviews] = await Promise.all([
      User.count(),
      Listing.count(),
      Payment.count(),
      Review.count(),
    ]);
    res.json({
      success: true,
      data: { totalUsers, totalListings, totalTransactions, totalReviews }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Récupère les signalements (reports)
 */
export const getReports = async (req, res) => {
  try {
    const reports = await Report.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Récupère les avis (reviews)
 */
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Récupère les paramètres admin (settings)
 */
export const getAdminSettings = async (req, res) => {
  try {
    const settings = await AdminSetting.findAll();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Sauvegarde/backup
 */
export const backup = async (req, res) => {
  try {
    // À adapter selon ta stack (pg_dump, etc.)
    res.json({ success: true, message: 'Backup lancé (stub)' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Logs système
 */
export const getLogs = async (req, res) => {
  try {
    // Prend le dernier fichier de logs combinés
    const logsDir = path.join(process.cwd(), 'backend/logs');
    const files = fs.readdirSync(logsDir).filter(f => f.startsWith('combined-'));
    if (!files.length) return res.json({ success: true, data: [] });
    const latestLog = files.sort().reverse()[0];
    const logPath = path.join(logsDir, latestLog);
    const logs = fs.readFileSync(logPath, 'utf8');
    res.json({ success: true, data: logs.split('\n').slice(-200) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Infos système
 */
export const getSystemInfo = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        uptime: os.uptime(),
        loadavg: os.loadavg(),
        totalmem: os.totalmem(),
        freemem: os.freemem(),
        platform: os.platform(),
        release: os.release(),
        nodeVersion: process.version,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Test d'envoi d'email
 */
export const emailTest = async (req, res) => {
  try {
    const { to } = req.body;
    await emailService.sendWelcomeEmail({ email: to || 'admin@domaine.com', first_name: 'Admin' });
    res.json({ success: true, message: 'Email de test envoyé' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Vider le cache
 */
export const clearCache = async (req, res) => {
  try {
    await redisClient.connect();
    await redisClient.client.flushAll();
    res.json({ success: true, message: 'Cache vidé' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
