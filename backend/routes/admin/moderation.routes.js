import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

// Middleware pour vérifier les permissions de modération
const requireModerator = [authenticate, authorize([ROLES.ADMIN, ROLES.MODERATOR])];

/**
 * @swagger
 * /api/admin/moderation/reports:
 *   get:
 *     summary: Récupère la liste des signalements
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des signalements
 */
router.get('/reports', requireModerator, async (req, res) => {
  try {
    // Simulation de données pour le prototype
    const reports = [
      {
        id: '1',
        title: 'Contenu inapproprié',
        reason: 'Contenu offensant',
        description: 'Cette annonce contient des propos inappropriés',
        contentType: 'listing',
        contentId: '123',
        reportedBy: { id: 'user1', name: 'John Doe' },
        severity: 'high',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Spam',
        reason: 'Publicité non autorisée',
        description: 'Ce commentaire est du spam',
        contentType: 'comment',
        contentId: '456',
        reportedBy: { id: 'user2', name: 'Jane Smith' },
        severity: 'medium',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          total: 2,
          totalPages: 1,
          currentPage: 1,
          perPage: 10
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des signalements',
        details: error.message
      }
    });
  }
});

/**
 * @swagger
 * /api/admin/moderation/reports/{id}/moderate:
 *   post:
 *     summary: Modérer un signalement
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject, ignore, delete]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signalement modéré avec succès
 */
router.post('/reports/:id/moderate', requireModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    // Validation
    if (!['approve', 'reject', 'ignore', 'delete'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Action invalide',
          details: 'L\'action doit être approve, reject, ignore ou delete'
        }
      });
    }

    // Simulation de traitement
    res.status(200).json({
      success: true,
      data: {
        id,
        action,
        moderatedBy: req.user.id,
        moderatedAt: new Date().toISOString()
      },
      message: 'Signalement modéré avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la modération du signalement',
        details: error.message
      }
    });
  }
});

/**
 * @swagger
 * /api/admin/moderation/stats:
 *   get:
 *     summary: Récupère les statistiques de modération
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques de modération
 */
router.get('/stats', requireModerator, async (req, res) => {
  try {
    // Simulation de données pour le prototype
    const stats = {
      pending: 5,
      today: 12,
      todayChange: 20,
      moderationRate: 85,
      moderatedToday: 10,
      removedContent: 25,
      removedThisMonth: 120
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques',
        details: error.message
      }
    });
  }
});

/**
 * @swagger
 * /api/admin/moderation/logs:
 *   get:
 *     summary: Récupère les logs de modération
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Logs de modération
 */
router.get('/logs', requireModerator, async (req, res) => {
  try {
    // Simulation de données pour le prototype
    const logs = [
      {
        id: '1',
        action: 'approve',
        contentType: 'listing',
        contentId: '123',
        moderator: { id: 'admin1', name: 'Admin User' },
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        action: 'reject',
        contentType: 'comment',
        contentId: '456',
        reason: 'Contenu inapproprié',
        moderator: { id: 'admin1', name: 'Admin User' },
        createdAt: new Date().toISOString()
      }
    ];

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des logs',
        details: error.message
      }
    });
  }
});

export default router;