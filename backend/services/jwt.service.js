import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import redisClient from '../config/redis.js';
import { JWT_CONFIG } from '../config/constants.js';

const signToken = (payload, secret, options) => 
  new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    });
  });

const verifyToken = (token, secret) => 
  new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || JWT_CONFIG.EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || JWT_CONFIG.REFRESH_EXPIRES_IN;

class JwtService {
  static async generateTokens(user) {
    const accessToken = await signToken(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || JWT_CONFIG.SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = await signToken(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || JWT_CONFIG.REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    // Stocker le refresh token dans Redis (si disponible)
    try {
      await redisClient.set(
        `refresh_token:${user.id}`,
        refreshToken,
        'EX',
        60 * 60 * 24 * 7 // 7 jours en secondes
      );
    } catch (redisError) {
      // Si Redis n'est pas disponible, on continue sans stockage
      console.log('⚠️  Redis non disponible, refresh token non stocké');
    }

    return { accessToken, refreshToken };
  }

  static async verifyAccessToken(token) {
    try {
      return await verifyToken(token, process.env.JWT_SECRET || JWT_CONFIG.SECRET);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  static async verifyRefreshToken(token) {
    try {
      const decoded = await verifyToken(token, process.env.JWT_REFRESH_SECRET || JWT_CONFIG.REFRESH_SECRET);
      
      // Vérifier le token dans Redis (si disponible)
      try {
        const storedToken = await redisClient.get(`refresh_token:${decoded.id}`);
        if (storedToken !== token) {
          throw new Error('Invalid refresh token');
        }
      } catch (redisError) {
        // Si Redis n'est pas disponible, on accepte le token
        console.log('⚠️  Redis non disponible, validation du refresh token ignorée');
      }
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async revokeRefreshToken(userId) {
    try {
      await redisClient.del(`refresh_token:${userId}`);
    } catch (redisError) {
      // Si Redis n'est pas disponible, on ignore
      console.log('⚠️  Redis non disponible, révocation du refresh token ignorée');
    }
  }
}

export default JwtService;
