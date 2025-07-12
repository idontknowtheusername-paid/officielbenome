import express from 'express';
import { body } from 'express-validator';
import AuthController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: L'ID unique de l'utilisateur
 *         firstName:
 *           type: string
 *           description: Le prénom de l'utilisateur
 *         lastName:
 *           type: string
 *           description: Le nom de famille de l'utilisateur
 *         email:
 *           type: string
 *           format: email
 *           description: L'adresse email de l'utilisateur
 *         phoneNumber:
 *           type: string
 *           description: Le numéro de téléphone de l'utilisateur
 *         role:
 *           type: string
 *           enum: [user, admin, moderator]
 *           description: Le rôle de l'utilisateur
 *         isVerified:
 *           type: boolean
 *           description: Si l'utilisateur est vérifié
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           description: Dernière connexion de l'utilisateur
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: La date de création du compte
 *     AuthTokens:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: Le token d'accès JWT
 *         refreshToken:
 *           type: string
 *           description: Le token de rafraîchissement JWT
 *         expiresIn:
 *           type: number
 *           description: Durée de validité du token en secondes
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Message d'erreur
 *             code:
 *               type: string
 *               description: Code d'erreur personnalisé
 *             details:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Détails des erreurs de validation
 */

// Validation des données d'entrée
const validate = (method) => {
  switch (method) {
    case 'register': {
      return [
        body('firstName', 'Le prénom est requis').notEmpty().trim().isLength({ min: 2, max: 50 }),
        body('lastName', 'Le nom est requis').notEmpty().trim().isLength({ min: 2, max: 50 }),
        body('email', 'Email invalide').isEmail().normalizeEmail(),
        body('phoneNumber', 'Numéro de téléphone invalide').matches(/^\+?[1-9]\d{1,14}$/),
        body('password', 'Le mot de passe doit contenir au moins 8 caractères')
          .isLength({ min: 8 })
          .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial')
      ];
    }
    case 'login': {
      return [
        body('email', 'Email invalide').isEmail().normalizeEmail(),
        body('password', 'Le mot de passe est requis').exists()
      ];
    }
    case 'forgotPassword': {
      return [
        body('email', 'Email invalide').isEmail().normalizeEmail()
      ];
    }
    case 'resetPassword': {
      return [
        body('token', 'Token requis').notEmpty(),
        body('newPassword', 'Le mot de passe doit contenir au moins 8 caractères')
          .isLength({ min: 8 })
          .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial')
      ];
    }
    case 'updateProfile': {
      return [
        body('firstName', 'Le prénom doit contenir entre 2 et 50 caractères').optional().isLength({ min: 2, max: 50 }),
        body('lastName', 'Le nom doit contenir entre 2 et 50 caractères').optional().isLength({ min: 2, max: 50 }),
        body('email', 'Email invalide').optional().isEmail().normalizeEmail(),
        body('phoneNumber', 'Numéro de téléphone invalide').optional().matches(/^\+?[1-9]\d{1,14}$/)
      ];
    }
    default:
      return [];
  }
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Le prénom de l'utilisateur
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Le nom de famille de l'utilisateur
 *               email:
 *                 type: string
 *                 format: email
 *                 description: L'adresse email de l'utilisateur
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^\+?[1-9]\d{1,14}$'
 *                 description: Le numéro de téléphone (format international)
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Le mot de passe (au moins 8 caractères avec majuscule, minuscule, chiffre et caractère spécial)
 *     responses:
 *       201:
 *         description: Utilisateur enregistré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Utilisateur déjà existant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', validate('register'), AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: L'adresse email de l'utilisateur
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Le mot de passe
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       $ref: '#/components/schemas/AuthTokens'
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', validate('login'), AuthController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion d'un utilisateur
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
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
 *                   example: Déconnexion réussie
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Demande de réinitialisation de mot de passe
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: L'adresse email de l'utilisateur
 *     responses:
 *       200:
 *         description: Email de réinitialisation envoyé
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
 *                   example: Si un compte avec cet email existe, un email de réinitialisation a été envoyé
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/forgot-password', validate('forgotPassword'), AuthController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Réinitialisation du mot de passe
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Le token de réinitialisation
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Le nouveau mot de passe
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
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
 *                   example: Votre mot de passe a été réinitialisé avec succès
 *       400:
 *         description: Token invalide ou expiré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/reset-password', validate('resetPassword'), AuthController.resetPassword);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé
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
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Mettre à jour le profil de l'utilisateur connecté
 *     tags: [Authentication]
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
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Le prénom de l'utilisateur
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Le nom de famille de l'utilisateur
 *               email:
 *                 type: string
 *                 format: email
 *                 description: L'adresse email de l'utilisateur
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^\+?[1-9]\d{1,14}$'
 *                 description: Le numéro de téléphone (format international)
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
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Non autorisé
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
 *       409:
 *         description: Email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/profile', authenticate, validate('updateProfile'), AuthController.updateProfile);

export default router;
