import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import redisClient from '../config/redis.js';

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

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

class JwtService {
  static async generateTokens(user) {
    const accessToken = await signToken(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = await signToken(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    // Stocker le refresh token dans Redis
    await redisClient.set(
      `refresh_token:${user.id}`,
      refreshToken,
      'EX',
      60 * 60 * 24 * 7 // 7 jours en secondes
    );

    return { accessToken, refreshToken };
  }

  static async verifyAccessToken(token) {
    try {
      return await verifyToken(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  static async verifyRefreshToken(token) {
    try {
      const decoded = await verifyToken(token, process.env.JWT_REFRESH_SECRET);
      const storedToken = await redisClient.get(`refresh_token:${decoded.id}`);
      
      if (storedToken !== token) {
        throw new Error('Invalid refresh token');
      }
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async revokeRefreshToken(userId) {
    await redisClient.del(`refresh_token:${userId}`);
  }
}

export default JwtService;
