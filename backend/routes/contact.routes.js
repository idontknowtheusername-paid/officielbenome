import express from 'express';
import { sendMessage, getMessages } from '../controllers/contact.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Envoyer un message de contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message envoyé
 *       400:
 *         description: Erreur de validation
 *   get:
 *     summary: Récupérer les messages de contact (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des messages de contact
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */

router.post('/', sendMessage);
router.get('/', authenticate, isAdmin, getMessages);

export default router;
