import express from 'express';
import * as usersController from '../controllers/users.controller.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Liste des utilisateurs (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 *   put:
 *     summary: Modifier un utilisateur (propriétaire ou admin)
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
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur modifié
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
 *   delete:
 *     summary: Supprimer un utilisateur (propriétaire ou admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
 *
 * /api/users/{id}/listings:
 *   get:
 *     summary: Liste paginée des annonces d'un utilisateur
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Liste paginée des annonces
 *
 * /api/users/{id}/reviews:
 *   get:
 *     summary: Liste paginée des avis reçus par un utilisateur
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Liste paginée des avis
 *
 * /api/users/me:
 *   put:
 *     summary: Modifier son profil utilisateur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: object
 *               preferredLanguage:
 *                 type: string
 *               currency:
 *                 type: string
 *               profilePictureUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil modifié
 *       400:
 *         description: Erreur de validation
 *
 * /api/users/me/password:
 *   put:
 *     summary: Modifier son mot de passe
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe modifié
 *       400:
 *         description: Erreur de validation
 *
 * /api/users/me/kyc:
 *   post:
 *     summary: Soumettre des documents KYC
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentType:
 *                 type: string
 *               documentNumber:
 *                 type: string
 *               documentImageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC soumis
 */

router.get('/', authenticate, isAdmin, usersController.getAllUsers);
router.get('/:id', usersController.getUserById);
router.put('/:id', authenticate,
  validate([
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('name').optional().isLength({ min: 2 }),
    body('phone').optional().isMobilePhone()
  ]),
  usersController.updateUser
);
router.delete('/:id', authenticate, usersController.deleteUser);

export default router;
