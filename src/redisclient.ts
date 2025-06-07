import { createClient } from 'redis';

// Redis Cloud 클라이언트 생성
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// Redis 연결 이벤트 처리
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis 연결됨');
});

redisClient.on('ready', () => {
  console.log('Redis 준비됨');
});

redisClient.on('end', () => {
  console.log('Redis 연결 종료');
});

// Redis 연결 함수
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis Cloud 연결 성공');
  } catch (error) {
    console.error('Redis 연결 실패:', error);
    throw error;
  }
};

// Redis 연결 해제 함수
export const disconnectRedis = async () => {
  try {
    await redisClient.disconnect();
    console.log('Redis 연결 해제');
  } catch (error) {
    console.error('Redis 연결 해제 실패:', error);
  }
};

export { redisClient };