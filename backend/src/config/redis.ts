import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Redis configuration - Railway & Upstash compatible
let redis: Redis;

if (process.env.REDIS_URL) {
  // Use REDIS_URL directly for Railway/Upstash
  console.log('🔗 Using REDIS_URL for Redis connection');
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableOfflineQueue: true,
    lazyConnect: false,
    connectTimeout: 10000,
    commandTimeout: 5000,
    // SSL/TLS configuration for Upstash
    ...(process.env.REDIS_URL.startsWith('rediss://') ? {
      tls: {
        rejectUnauthorized: false
      }
    } : {}),
  });
} else {
  // Fallback to individual environment variables
  console.log('🔗 Using individual Redis config');
  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    maxRetriesPerRequest: 3,
    enableOfflineQueue: true,
    lazyConnect: false,
    connectTimeout: 10000,
    commandTimeout: 5000,
  };
  redis = new Redis(redisConfig);
}

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
