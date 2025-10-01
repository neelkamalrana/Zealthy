import Redis from 'ioredis';

// Create Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Connection events
redis.on('connect', () => {
  console.log('✅ Redis: Connected successfully');
});

redis.on('ready', () => {
  console.log('✅ Redis: Ready to accept commands');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

redis.on('close', () => {
  console.log('⚠️  Redis: Connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis: Reconnecting...');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await redis.quit();
  console.log('Redis connection closed gracefully');
  process.exit(0);
});

export default redis;

