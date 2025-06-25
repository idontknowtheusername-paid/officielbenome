import express from 'express';
import { body } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import UserController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Appliquer le middleware d'authentification à toutes les routes
router.use(authenticate);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', UserController.getCurrentUser);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Mettre à jour le profil de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Requis uniquement pour changer le mot de passe
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Le nouveau mot de passe
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Données d'entrée invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: L'email est déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  '/me',
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Le nom d\'utilisateur doit contenir entre 3 et 30 caractères'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Veuillez fournir une adresse email valide')
      .normalizeEmail(),
    body('newPassword')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/[0-9]/)
      .withMessage('Le mot de passe doit contenir au moins un chiffre')
      .matches(/[a-z]/)
      .withMessage('Le mot de passe doit contenir au moins une minuscule')
      .matches(/[A-Z]/)
      .withMessage('Le mot de passe doit contenir au moins une majuscule'),
  ],
  UserController.updateProfile
);

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Supprimer le compte utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Le mot de passe actuel pour confirmer la suppression
 *     responses:
 *       200:
 *         description: Compte supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Votre compte a été supprimé avec succès
 *       400:
 *         description: Mot de passe manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/me', [
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis pour confirmer la suppression')
], UserController.deleteAccount);

export default router;
