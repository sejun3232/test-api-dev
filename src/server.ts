import Fastify, { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { redisClient, connectRedis } from './redisclient';
import { connectMongoDB } from './mongoDB';
import { registerRoutes } from './routes';
import cookie from '@fastify/cookie'; // 추가

export const createServer = async (): Promise<FastifyInstance> => {
  const fastify: FastifyInstance = Fastify({
    logger: true
  });

  // 쿠키 플러그인 등록 (여기 추가)
  await fastify.register(cookie, { secret: process.env.JWT_SECRET });

  // JWT 플러그인 등록
  await fastify.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  });

  // 라우트 등록
  registerRoutes(fastify);

  // MongoDB 연결
  await connectMongoDB();
  
  // Redis 연결
  await connectRedis();

  // Socket.IO 설정
  const io = new SocketIOServer(fastify.server, {
    cors: { origin: "*" }
  });

  // Fastify 인스턴스에 io 등록 (이 한 줄 추가!)
  (fastify as any).io = io;

  io.on('connection', async (socket) => {
    console.log('Socket.IO 연결됨:', socket.id);

    // JWT 인증 처리
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const user = await fastify.jwt.verify(token);
        socket.data.user = user; // 소켓에 유저 정보 저장
        console.log('소켓 인증 성공:', user);
      } catch (err) {
        console.log('소켓 인증 실패:', err);
        socket.disconnect(true); // 인증 실패 시 연결 종료
        return;
      }
    } else {
      console.log('토큰 없음, 소켓 연결 종료');
      socket.disconnect(true);
      return;
    }

    socket.on('message', async (msg) => {
      console.log('받은 메시지:', msg);
      await redisClient.set(`message:${socket.id}`, msg);
      socket.emit('message', `Echo: ${msg}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO 연결 해제:', socket.id);
    });
  });

  return fastify;
};