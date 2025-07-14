import express from 'express';
import * as messagesController from '../controllers/messages.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { body as vBody, validationResult as vResult } from 'express-validator';
import db from '../config/database.js';
const router = express.Router();

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Liste de tous les messages (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des messages
 *   post:
 *     summary: Envoyer un message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               toUserId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message créé
 *       400:
 *         description: Erreur de validation
 *
 * /api/messages/{id}:
 *   get:
 *     summary: Récupérer un message par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message trouvé
 *       404:
 *         description: Message non trouvé
 *   delete:
 *     summary: Supprimer un message (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message supprimé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Message non trouvé
 *
 * /api/messages/{id}/read:
 *   put:
 *     summary: Marquer un message comme lu
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message marqué comme lu
 *       404:
 *         description: Message non trouvé
 *
 * /api/messages/conversations/{conversationId}/messages:
 *   get:
 *     summary: Liste paginée des messages d'une conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Liste paginée des messages
 *       404:
 *         description: Conversation non trouvée
 *   post:
 *     summary: Envoyer un message dans une conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               attachmentUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message envoyé
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Conversation non trouvée
 *
 * /api/messages/conversations:
 *   get:
 *     summary: Liste des conversations de l'utilisateur
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations
 *   post:
 *     summary: Démarrer une nouvelle conversation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantId:
 *                 type: string
 *               listingId:
 *                 type: string
 *               initialMessage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation créée et message envoyé
 *       400:
 *         description: Erreur de validation
 */

// Routes pour la messagerie interne
router.get('/', authenticate, isAdmin, messagesController.getAllMessages);
router.get('/:id', authenticate, messagesController.getMessageById);
router.post('/', authenticate, [
  body('content').isString().isLength({ min: 1 }),
  body('toUserId').isString().notEmpty()
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return messagesController.createMessage(req, res, next);
});
router.put('/:id/read', authenticate, messagesController.markAsRead);
router.delete('/:id', authenticate, isAdmin, messagesController.deleteMessage);

// Conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, 
             u1.first_name as participant1_first_name, u1.last_name as participant1_last_name,
             u2.first_name as participant2_first_name, u2.last_name as participant2_last_name,
             l.title as listing_title,
             m.content as last_message_content, m.created_at as last_message_time
      FROM conversations c
      JOIN users u1 ON c.participant1_id = u1.id
      JOIN users u2 ON c.participant2_id = u2.id
      LEFT JOIN listings l ON c.listing_id = l.id
      LEFT JOIN messages m ON c.last_message_id = m.id
      WHERE c.participant1_id = $1 OR c.participant2_id = $1
      ORDER BY COALESCE(m.created_at, c.created_at) DESC
    `, [req.user.id]);
    res.json({ conversations: result.rows });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/conversations/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conversationResult = await db.query(
      'SELECT * FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)',
      [conversationId, req.user.id]
    );
    if (conversationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    const result = await db.query(`
      SELECT m.*, u.first_name, u.last_name, u.profile_picture_url
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [conversationId, limit, offset]);
    await db.query(
      'UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_id != $2',
      [conversationId, req.user.id]
    );
    res.json({ messages: result.rows.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/conversations/:conversationId/messages', authenticate, [
  vBody('content').trim().isLength({ min: 1, max: 1000 })
], async (req, res) => {
  const errors = vResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { conversationId } = req.params;
    const { content, attachmentUrl } = req.body;
    const conversationResult = await db.query(
      'SELECT * FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)',
      [conversationId, req.user.id]
    );
    if (conversationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    const conversation = conversationResult.rows[0];
    const receiverId = conversation.participant1_id === req.user.id 
      ? conversation.participant2_id 
      : conversation.participant1_id;
    const messageResult = await db.query(`
      INSERT INTO messages (conversation_id, sender_id, content, attachment_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [conversationId, req.user.id, content, attachmentUrl]);
    const message = messageResult.rows[0];
    await db.query(
      'UPDATE conversations SET last_message_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [message.id, conversationId]
    );
    // Notification et socket.io à brancher ici si besoin
    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/conversations', authenticate, [
  vBody('participantId').isUUID(),
  vBody('listingId').optional().isUUID(),
  vBody('initialMessage').trim().isLength({ min: 1, max: 1000 })
], async (req, res) => {
  const errors = vResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { participantId, listingId, initialMessage } = req.body;
    if (participantId === req.user.id) {
      return res.status(400).json({ message: 'Cannot start conversation with yourself' });
    }
    const existingConversation = await db.query(`
      SELECT id FROM conversations 
      WHERE ((participant1_id = $1 AND participant2_id = $2) 
          OR (participant1_id = $2 AND participant2_id = $1))
      AND ($3::uuid IS NULL OR listing_id = $3)
    `, [req.user.id, participantId, listingId]);
    let conversationId;
    if (existingConversation.rows.length > 0) {
      conversationId = existingConversation.rows[0].id;
    } else {
      const conversationResult = await db.query(`
        INSERT INTO conversations (participant1_id, participant2_id, listing_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [req.user.id, participantId, listingId]);
      conversationId = conversationResult.rows[0].id;
    }
    const messageResult = await db.query(`
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [conversationId, req.user.id, initialMessage]);
    const message = messageResult.rows[0];
    await db.query(
      'UPDATE conversations SET last_message_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [message.id, conversationId]
    );
    res.status(201).json({ 
      conversationId,
      message 
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
