import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import logger from '../config/logger.js';

class UserController {
  /**
   * Récupère les informations de l'utilisateur connecté
   */
  static async getCurrentUser(req, res, next) {
    try {
      // L'utilisateur est ajouté à la requête par le middleware d'authentification
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
      });

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Utilisateur non trouvé',
          },
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération du profil utilisateur:', error);
      next(error);
    }
  }

  /**
   * Met à jour le profil de l'utilisateur
   */
  static async updateProfile(req, res, next) {
    try {
      const { id } = req.user;
      const { username, email, currentPassword, newPassword } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Utilisateur non trouvé',
          },
        });
      }

      // Mettre à jour les champs de base
      if (username) user.username = username;
      if (email && email !== user.email) {
        // Vérifier si l'email est déjà utilisé
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
          return res.status(StatusCodes.CONFLICT).json({
            success: false,
            error: {
              code: 'EMAIL_ALREADY_EXISTS',
              message: 'Cet email est déjà utilisé par un autre compte',
            },
          });
        }
        user.email = email;
      }

      // Changer le mot de passe si fourni
      if (newPassword) {
        if (!currentPassword) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: {
              code: 'CURRENT_PASSWORD_REQUIRED',
              message: 'Le mot de passe actuel est requis pour effectuer cette action',
            },
          });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            error: {
              code: 'INVALID_PASSWORD',
              message: 'Le mot de passe actuel est incorrect',
            },
          });
        }

        user.password = await bcrypt.hash(newPassword, 12);
      }

      await user.save();

      // Ne pas renvoyer le mot de passe dans la réponse
      const userResponse = user.get({ plain: true });
      delete userResponse.password;
      delete userResponse.resetPasswordToken;
      delete userResponse.resetPasswordExpires;

      res.json({
        success: true,
        data: userResponse,
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du profil:', error);
      next(error);
    }
  }

  /**
   * Supprime le compte utilisateur
   */
  static async deleteAccount(req, res, next) {
    try {
      const { id } = req.user;
      const { password } = req.body;

      if (!password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'PASSWORD_REQUIRED',
            message: 'Le mot de passe est requis pour supprimer le compte',
          },
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Utilisateur non trouvé',
          },
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Le mot de passe est incorrect',
          },
        });
      }

      // Supprimer l'utilisateur
      await user.destroy();

      // Révoquer les tokens
      await JwtService.revokeRefreshToken(id);

      res.json({
        success: true,
        message: 'Votre compte a été supprimé avec succès',
      });
    } catch (error) {
      logger.error('Erreur lors de la suppression du compte:', error);
      next(error);
    }
  }
}

export default UserController;
