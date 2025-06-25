import { StatusCodes } from 'http-status-codes';
import JwtService from '../services/jwt.service.js';
import logger from '../config/logger.js';

class AuthMiddleware {
  static async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'AUTH_HEADER_MISSING',
            message: 'Authorization header is missing or invalid'
          }
        });
      }

      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = await JwtService.verifyAccessToken(token);
        req.user = decoded;
        next();
      } catch (error) {
        logger.error(`Token verification failed: ${error.message}`);
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token'
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static authorize(roles = []) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required'
            }
          });
        }

        if (roles.length && !roles.includes(req.user.role)) {
          return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to access this resource'
            }
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'REFRESH_TOKEN_REQUIRED',
            message: 'Refresh token is required'
          }
        });
      }

      try {
        const decoded = await JwtService.verifyRefreshToken(refreshToken);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
          return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found'
            }
          });
        }

        const tokens = await JwtService.generateTokens(user);
        
        res.json({
          success: true,
          data: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role
            }
          }
        });
      } catch (error) {
        logger.error(`Refresh token error: ${error.message}`);
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token'
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

export const { authenticate, authorize, refreshToken } = AuthMiddleware;
export default AuthMiddleware;
