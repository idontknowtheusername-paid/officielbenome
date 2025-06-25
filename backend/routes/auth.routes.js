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
 *         isOnline:
 *           type: boolean
 *           description: Statut de connexion de l'utilisateur
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
        body('email', 'Email invalide').isEmail().normalizeEmail(),
        body('password', 'Le mot de passe doit contenir au moins 6 caractères')
          .isLength({ min: 6 }),
        body('firstName', 'Le prénom est requis').notEmpty().trim(),
        body('lastName', 'Le nom est requis').notEmpty().trim()
      ];
    }
    case 'login': {
      return [
        body('email', 'Email invalide').isEmail().normalizeEmail(),
        body('password', 'Le mot de passe est requis').exists()
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
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: L'adresse email de l'utilisateur
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Le mot de passe (au moins 6 caractères)
 *               firstName:
 *                 type: string
 *                 description: Le prénom de l'utilisateur
 *               lastName:
 *                 type: string
 *                 description: Le nom de famille de l'utilisateur
 *               phoneNumber:
 *                 type: string
 *                 description: Le numéro de téléphone (optionnel)
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
 *                 message:
 *                   type: string
 *                   example: Utilisateur enregistré avec succès
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur de validation ou utilisateur existant
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
 *                 message:
 *                   type: string
 *                   example: Connexion réussie
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 refreshToken:
 *                   type: string
 *                   description: Refresh token pour obtenir un nouveau token d'accès
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 * /api/auth/refresh-token:
 *   post:
 *     summary: Rafraîchir le token d'accès
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Le refresh token précédemment émis
 *     responses:
 *       200:
 *         description: Token rafraîchi avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: Nouveau JWT token
 *                 refreshToken:
 *                   type: string
 *                   description: Nouveau refresh token
 *       400:
 *         description: Token de rafraîchissement invalide ou manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/refresh-token', AuthController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion de l'utilisateur
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
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     tags: [Authentication]
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
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;
