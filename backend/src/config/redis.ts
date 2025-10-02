import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Redis configuration - Railway & Upstash compatible
const redisConfig = {
  // Railway/Upstash provides REDIS_URL, parse it if available
  ...(process.env.REDIS_URL ? {} : {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  }),
  // Use REDIS_URL if provided (Railway/Upstash format)
  ...(process.env.REDIS_URL ? { url: process.env.REDIS_URL } : {}),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3, // Allow some retries for connection
  enableOfflineQueue: true, // Allow queuing commands when offline
  lazyConnect: false, // Connect immediately
  connectTimeout: 10000,
  commandTimeout: 5000,
  // SSL/TLS configuration for Upstash
  ...(process.env.REDIS_URL?.startsWith('rediss://') ? {
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  } : {}),
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
