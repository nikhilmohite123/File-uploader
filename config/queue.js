// queue/config.js
export const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
};

export const defaultQueueConfig = {
  removeOnComplete: {
    count: 100,             
    age: 60 * 60 * 24,     
  },
  attempts: 3,              // retry failed jobs 3 times
  backoff: {
    type: "exponential",    
    delay: 1000,            
  },
};
