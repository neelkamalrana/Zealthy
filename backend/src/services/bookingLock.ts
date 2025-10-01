import redis from '../config/redis';

export class BookingLockService {
  // Lock duration in seconds (10 seconds to complete booking)
  private readonly LOCK_DURATION = 10;
  
  /**
   * Try to acquire a lock for booking a specific time slot
   * Returns true if lock acquired, false if already locked
   */
  async acquireLock(provider: string, datetime: string, userId: string): Promise<boolean> {
    const lockKey = `booking:${provider}:${datetime}`;
    
    try {
      // NX = only set if not exists, EX = expiration in seconds
      const result = await redis.set(
        lockKey,
        userId,
        'EX', this.LOCK_DURATION,
        'NX'
      );
      
      return result === 'OK';
    } catch (error) {
      console.error('Error acquiring lock:', error);
      return false;
    }
  }
  
  /**
   * Release the lock after booking is complete
   */
  async releaseLock(provider: string, datetime: string): Promise<void> {
    const lockKey = `booking:${provider}:${datetime}`;
    
    try {
      await redis.del(lockKey);
    } catch (error) {
      console.error('Error releasing lock:', error);
    }
  }
  
  /**
   * Check who holds the lock
   */
  async getLockOwner(provider: string, datetime: string): Promise<string | null> {
    const lockKey = `booking:${provider}:${datetime}`;
    
    try {
      return await redis.get(lockKey);
    } catch (error) {
      console.error('Error getting lock owner:', error);
      return null;
    }
  }
  
  /**
   * Extend lock if booking is taking longer
   */
  async extendLock(provider: string, datetime: string): Promise<boolean> {
    const lockKey = `booking:${provider}:${datetime}`;
    
    try {
      const result = await redis.expire(lockKey, this.LOCK_DURATION);
      return result === 1;
    } catch (error) {
      console.error('Error extending lock:', error);
      return false;
    }
  }
  
  /**
   * Check if a lock exists for a specific slot
   */
  async hasLock(provider: string, datetime: string): Promise<boolean> {
    const lockKey = `booking:${provider}:${datetime}`;
    
    try {
      const exists = await redis.exists(lockKey);
      return exists === 1;
    } catch (error) {
      console.error('Error checking lock:', error);
      return false;
    }
  }
}

export const bookingLock = new BookingLockService();


