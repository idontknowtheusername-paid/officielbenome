import { createClient } from 'redis';
import logger from './logger.js';

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;

    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 5) {
              logger.error('Too many retries on Redis. Connection terminated');
              return new Error('Too many retries on Redis.');
            }
            // Attendre 1 seconde entre chaque tentative
            return Math.min(retries * 100, 5000);
          },
        },
      });

      this.client.on('error', (err) => {
        logger.error(`Redis error: ${err}`);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis client reconnecting...');
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.warn('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error(`Failed to connect to Redis: ${error.message}`);
      throw error;
    }
  }

  async get(key) {
    if (!this.isConnected) await this.connect();
    return this.client.get(key);
  }

  async set(key, value, ttl) {
    if (!this.isConnected) await this.connect();
    const options = ttl ? { EX: ttl } : undefined;
    return this.client.set(key, value, options);
  }

  async del(key) {
    if (!this.isConnected) await this.connect();
    return this.client.del(key);
  }

  async expire(key, ttl) {
    if (!this.isConnected) await this.connect();
    return this.client.expire(key, ttl);
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

const redisClient = new RedisClient();

export default redisClient;
