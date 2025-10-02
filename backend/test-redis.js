const Redis = require('ioredis');

const redisUrl = 'rediss://default:AT62AAIncDJhMmQ2MTdkNzE5ZGU0MWE5OGM5YjI2OWI3NjMwNGM4M3AyMTYwNTQ@thankful-termite-16054.upstash.io:6379';

console.log('Testing Redis connection...');
console.log('URL:', redisUrl);

const redis = new Redis(redisUrl, {
  tls: {
    rejectUnauthorized: false
  },
  connectTimeout: 10000,
  commandTimeout: 5000,
  maxRetriesPerRequest: 3,
  enableOfflineQueue: true,
  lazyConnect: false,
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('ready', () => {
  console.log('✅ Redis ready to accept commands');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error.message);
  console.error('Full error:', error);
});

redis.on('close', () => {
  console.log('🔌 Redis connection closed');
});

// Test the connection
async function testConnection() {
  try {
    console.log('Testing PING command...');
    const result = await redis.ping();
    console.log('✅ PING result:', result);
    
    console.log('Testing SET command...');
    await redis.set('test-key', 'test-value');
    console.log('✅ SET command successful');
    
    console.log('Testing GET command...');
    const value = await redis.get('test-key');
    console.log('✅ GET result:', value);
    
    console.log('Testing DEL command...');
    await redis.del('test-key');
    console.log('✅ DEL command successful');
    
    console.log('🎉 All Redis tests passed!');
  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    redis.disconnect();
    process.exit(0);
  }
}

// Run the test
testConnection();
