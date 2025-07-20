import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import * as adminController from '../controllers/admin.controller.js';
import { ROLES } from '../config/constants.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// Middleware d'authentification et d'autorisation pour les admins
const requireAdmin = [authenticate, authorize([ROLES.ADMIN])];

// Appliquer le middleware à toutes les routes admin
router.use(requireAdmin);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Récupère les statistiques du tableau de bord admin
 *     security:
 *       - bearerAuth: []
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Statistiques du tableau de bord
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total: { type: number }
 *                         active: { type: number }
 *                     listings:
 *                       type: object
 *                       properties:
 *                         total: { type: number }
 *                         pending: { type: number }
 *                     revenue: { type: number }
 *                     recentActivities: { type: array }
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé - Admin requis
 *       500:
 *         description: Erreur serveur
 */
router.get('/dashboard', adminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Liste des utilisateurs avec pagination
 *     security:
 *       - bearerAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 100 }
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Terme de recherche (nom ou email)
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: ['active', 'suspended', 'pending'] }
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste paginée des utilisateurs
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé - Admin requis
 */
router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().trim().escape(),
    query('status').optional().isIn(['active', 'suspended', 'pending']),
  ],
  validateRequest,
  adminController.getUsers
);

/**
 * @swagger
 * /api/admin/users/{userId}/status:
 *   put:
 *     summary: Met à jour le statut d'un utilisateur
 *     security:
 *       - bearerAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, suspended, pending]
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Statut utilisateur mis à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé - Admin requis
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put(
  '/users/:userId/status',
  [
    param('userId').isUUID().withMessage('ID utilisateur invalide'),
    body('status').isIn(['active', 'suspended', 'pending']).withMessage('Statut invalide'),
    body('reason').optional().isString().trim().isLength({ max: 500 }),
  ],
  validateRequest,
  adminController.updateUserStatus
);

/**
 * @swagger
 * /api/admin/listings:
 *   get:
 *     summary: Récupère la liste des annonces avec pagination
 *     security:
 *       - bearerAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: ['PENDING_APPROVAL', 'ACTIVE', 'REJECTED'], default: 'PENDING_APPROVAL' }
 *         description: Statut des annonces à récupérer
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste paginée des annonces
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé - Admin requis
 */
router.get(
  '/listings',
  [
    query('status').optional().isIn(['PENDING_APPROVAL', 'ACTIVE', 'REJECTED']),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validateRequest,
  adminController.getListings
);

/**
 * @swagger
 * /api/admin/listings/{id}/approve:
 *   put:
 *     summary: Approuve une annonce
 *     security:
 *       - bearerAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID de l'annonce à approuver
 *     responses:
 *       200:
 *         description: Annonce approuvée avec succès
 *       404:
 *         description: Annonce non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put(
  '/listings/:id/approve',
  [
    param('id').isUUID().withMessage('ID d\'annonce invalide')
  ],
  validateRequest,
  adminController.approveListing
);

/**
 * @swagger
 * /api/admin/listings/{id}/reject:
 *   put:
 *     summary: Rejette une annonce
 *     security:
 *       - bearerAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID de l'annonce à rejeter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Raison du rejet
 *                 minLength: 10
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Annonce rejetée avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Annonce non trouvée
 */
router.put(
  '/listings/:id/reject',
  [
    param('id').isUUID().withMessage('ID d\'annonce invalide'),
    body('reason').isString().trim().isLength({ min: 10, max: 500 })
  ],
  validateRequest,
  adminController.rejectListing
);

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: Récupère la liste des transactions avec pagination
 *     security:
 *       - bearerAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *         description: Statut des transactions à filtrer
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste paginée des transactions
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé - Admin requis
 */
router.get(
  '/transactions',
  [
    query('status').optional().trim(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validateRequest,
  adminController.getTransactions
);

export default router;