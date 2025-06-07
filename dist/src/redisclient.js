"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.disconnectRedis = exports.connectRedis = void 0;
const redis_1 = require("redis");
// Redis Cloud 클라이언트 생성
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
exports.redisClient = redisClient;
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
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Redis Cloud 연결 성공');
    }
    catch (error) {
        console.error('Redis 연결 실패:', error);
        throw error;
    }
};
exports.connectRedis = connectRedis;
// Redis 연결 해제 함수
const disconnectRedis = async () => {
    try {
        await redisClient.disconnect();
        console.log('Redis 연결 해제');
    }
    catch (error) {
        console.error('Redis 연결 해제 실패:', error);
    }
};
exports.disconnectRedis = disconnectRedis;
