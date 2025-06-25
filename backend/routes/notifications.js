import { Router } from 'express';
import * as notificationsController from '../controllers/notifications.controller.js';

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Liste des notifications de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des notifications
 *
 * /api/notifications/{id}:
 *   get:
 *     summary: Récupérer une notification par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification trouvée
 *       404:
 *         description: Notification non trouvée
 *   delete:
 *     summary: Supprimer une notification
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification supprimée
 *       404:
 *         description: Notification non trouvée
 *
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Marquer une notification comme lue
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *       404:
 *         description: Notification non trouvée
 */

router.get('/', notificationsController.getAllNotifications);
router.get('/:id', notificationsController.getNotificationById);
router.put('/:id/read', notificationsController.markAsRead);
router.delete('/:id', notificationsController.deleteNotification);

export default router;