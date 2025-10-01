import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis instance
const redis = new Redis(redisConfig);

// Handle connection events
redis.on('connect', () => {
  console.log('🔗 Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error.message);
  // Don't exit the process, just log the error
  // The app can still work without Redis (booking locks will be disabled)
});

redis.on('close', () => {
  console.log('🔌 Redis connection closed');
});

// Graceful shutdown
process.on('SIGINT', () => {
  redis.disconnect();
});

process.on('SIGTERM', () => {
  redis.disconnect();
});

export default redis;
