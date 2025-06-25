import express from 'express';
import * as reviewsController from '../controllers/reviews.controller.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import swaggerJsdoc from 'swagger-jsdoc';
import { NotificationService, NOTIFICATION_TYPES } from '../services/notificationService.js';
const router = express.Router();

// Routes CRUD pour les avis
// Pagination, tri, filtrage sur GET /
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC', rating, listingId } = req.query;
    const where = {};
    if (rating) where.rating = rating;
    if (listingId) where.listingId = listingId;
    const reviews = await reviewsController.getPaginatedReviews({ page, limit, sort, order, where });
    res.json({ success: true, ...reviews });
  } catch (err) { next(err); }
});
router.get('/:id', reviewsController.getReviewById);
// POST /api/reviews (anti-doublon, userId auto, notification)
router.post('/', authenticate, validate([
  body('listingId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isString()
]), async (req, res, next) => {
  try {
    // userId auto depuis le token
    const userId = req.user.id;
    const { listingId } = req.body;
    // Anti-doublon : un seul avis par user/listing
    const existing = await reviewsController.findReviewByUserAndListing(userId, listingId);
    if (existing) {
      return res.status(400).json({ success: false, error: { message: 'Vous avez déjà laissé un avis pour cette annonce.' } });
    }
    req.body.userId = userId; // ignore userId du body
    const created = await reviewsController.createReview(req, res);
    // Notifier l'auteur du listing
    const listingOwner = await reviewsController.getListingOwner(created.listingId);
    if (listingOwner) {
      await NotificationService.createNotification({
        user: listingOwner,
        type: NOTIFICATION_TYPES.NEW_REVIEW,
        title: 'Nouvel avis reçu',
        content: `Votre annonce a reçu un nouvel avis (${created.rating}/5)`,
        link: `/listings/${created.listingId}`
      });
    }
    res.status(201).json(created);
  } catch (err) { next(err); }
});

// Contrôle d'accès sur update/delete : auteur ou admin
router.put('/:id', authenticate, validate([
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().isString()
]), async (req, res, next) => {
  try {
    const review = await reviewsController.getReviewByIdRaw(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: { message: 'Review not found' } });
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Accès refusé' } });
    }
    const updated = await reviewsController.updateReview(req, res);
    // Notifier l'auteur du listing si modifié
    const listingOwner = await reviewsController.getListingOwner(updated.listingId);
    if (listingOwner) {
      await NotificationService.createNotification({
        user: listingOwner,
        type: NOTIFICATION_TYPES.REVIEW_UPDATED,
        title: 'Avis modifié',
        content: `Un avis sur votre annonce a été modifié.`,
        link: `/listings/${updated.listingId}`
      });
    }
    res.json(updated);
  } catch (err) { next(err); }
});
// DELETE /api/reviews/:id (contrôle d'accès, notification)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const review = await reviewsController.getReviewByIdRaw(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: { message: 'Review not found' } });
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Accès refusé' } });
    }
    await reviewsController.deleteReview(req, res);
    // Notifier l'auteur du listing si supprimé
    const listingOwner = await reviewsController.getListingOwner(review.listingId);
    if (listingOwner) {
      await NotificationService.createNotification({
        user: listingOwner,
        type: NOTIFICATION_TYPES.REVIEW_DELETED,
        title: 'Avis supprimé',
        content: `Un avis sur votre annonce a été supprimé.`,
        link: `/listings/${review.listingId}`
      });
    }
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
});

// GET reviews by user (avec pagination, enrichissement)
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.query;
    const userId = req.params.userId;
    const reviews = await reviewsController.getPaginatedReviews({
      page, limit, sort, order, where: { userId }, include: ['listing']
    });
    res.json({ success: true, ...reviews });
  } catch (err) { next(err); }
});
// GET reviews by listing (avec pagination, enrichissement)
router.get('/listing/:listingId', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.query;
    const listingId = req.params.listingId;
    const reviews = await reviewsController.getPaginatedReviews({
      page, limit, sort, order, where: { listingId }, include: ['user']
    });
    res.json({ success: true, ...reviews });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Liste paginée des avis
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *       - in: query
 *         name: order
 *         schema: { type: string }
 *       - in: query
 *         name: rating
 *         schema: { type: integer }
 *       - in: query
 *         name: listingId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste paginée des avis
 *   post:
 *     summary: Créer un nouvel avis (authentifié, anti-doublon)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               listingId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Avis créé
 *       400:
 *         description: Erreur de validation ou doublon
 *
 * /api/reviews/{id}:
 *   get:
 *     summary: Récupérer un avis par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Avis trouvé
 *       404:
 *         description: Avis non trouvé
 *   put:
 *     summary: Modifier un avis (auteur ou admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Avis modifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Avis non trouvé
 *   delete:
 *     summary: Supprimer un avis (auteur ou admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Avis supprimé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Avis non trouvé
 *
 * /api/reviews/user/{userId}:
 *   get:
 *     summary: Liste paginée des avis d'un utilisateur
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *       - in: query
 *         name: order
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste paginée des avis de l'utilisateur
 *
 * /api/reviews/listing/{listingId}:
 *   get:
 *     summary: Liste paginée des avis d'une annonce
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *       - in: query
 *         name: order
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste paginée des avis de l'annonce
 */

export default router;
