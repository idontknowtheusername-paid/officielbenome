import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import JwtService from '../services/jwt.service.js';
import emailService from '../services/emailService.js';
import logger from '../config/logger.js';

class AuthController {
  static async register(req, res, next) {
    try {
      console.log('[AUTH] Tentative inscription:', {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber
      });
      // Validation des données d'entrée
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Erreur de validation',
            details: errors.array()
          }
        });
      }

      const { firstName, lastName, email, phoneNumber, password } = req.body;
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({
        where: { email }
      });

      if (existingUser) {
        return res.status(StatusCodes.CONFLICT).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'Un utilisateur avec cet email existe déjà'
          }
        });
      }
      
      // Créer l'utilisateur
      const user = await User.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        role: 'user' // Rôle par défaut
      });

      // Générer les tokens
      const tokens = await JwtService.generateTokens(user);

      // Envoyer l'email de bienvenue (en arrière-plan)
      try {
        await emailService.sendWelcomeEmail(user);
      } catch (emailError) {
        logger.error('Failed to send welcome email:', emailError);
        // Ne pas échouer la requête si l'email échoue
      }

      // Réponse réussie
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            createdAt: user.createdAt
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '15m'
          }
        }
      });
    } catch (error) {
      console.error('Registration error:', error, error?.stack);
      logger.error('Registration error:', error);
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Vérifier si l'utilisateur existe
      const user = await User.scope('withPassword').findOne({ where: { email } });
      
      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email ou mot de passe incorrect'
          }
        });
      }

      // Vérifier le mot de passe
      const isPasswordValid = await user.isValidPassword(password);
      
      if (!isPasswordValid) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email ou mot de passe incorrect'
          }
        });
      }

      // Générer les tokens
      const tokens = await JwtService.generateTokens(user);

      // Mettre à jour la date de dernière connexion
      await user.update({ lastLoginAt: new Date() });

      // Réponse réussie
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '15m'
          }
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      // Récupérer l'utilisateur depuis le token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Non autorisé'
          }
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.decode(token);
      
      if (decoded && decoded.id) {
        // Révoquer le refresh token
        await JwtService.revokeRefreshToken(decoded.id);
      }

      res.json({
        success: true,
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      
      // Vérifier si l'utilisateur existe
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        // Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
        return res.json({
          success: true,
          message: 'Si un compte avec cet email existe, un email de réinitialisation a été envoyé'
        });
      }

      // Générer un token de réinitialisation
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure
      
      // Mettre à jour l'utilisateur avec le token
      await user.update({
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry
      });

      // Envoyer l'email de réinitialisation
      await emailService.sendPasswordResetEmail(user, resetToken);

      res.json({
        success: true,
        message: 'Si un compte avec cet email existe, un email de réinitialisation a été envoyé'
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      
      // Trouver l'utilisateur avec un token valide
      const user = await User.scope('withResetToken').findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [Op.gt]: new Date() }
        }
      });

      if (!user) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Le lien de réinitialisation est invalide ou a expiré'
          }
        });
      }

      // Mettre à jour le mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await user.update({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });

      // Envoyer une confirmation par email
      await emailService.sendPasswordChangedConfirmation(user);

      res.json({
        success: true,
        message: 'Votre mot de passe a été réinitialisé avec succès'
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id);
      
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Utilisateur non trouvé'
          }
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isVerified: user.isVerified,
            lastLoginAt: user.lastLoginAt,
            profileImage: user.profileImage,
            createdAt: user.createdAt
          }
        }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, email, phoneNumber } = req.body;
      
      const user = await User.findByPk(req.user.id);
      
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Utilisateur non trouvé'
          }
        });
      }

      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(StatusCodes.CONFLICT).json({
            success: false,
            error: {
              code: 'EMAIL_EXISTS',
              message: 'Cet email est déjà utilisé'
            }
          });
        }
      }

      // Mettre à jour le profil
      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: email || user.email,
        phoneNumber: phoneNumber || user.phoneNumber
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isVerified: user.isVerified,
            lastLoginAt: user.lastLoginAt,
            profileImage: user.profileImage,
            createdAt: user.createdAt
          }
        }
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      next(error);
    }
  }
}

export default AuthController;
