import { FastifyInstance } from 'fastify';
import { HelloRoute } from '../routes/hello.route';
import { registerAuthRoute } from '../routes/auth.route';
import { registerUserRoute } from '../routes/user.route';


export const registerRoutes = (fastify: FastifyInstance) => {
  // 모든 라우트 등록
  HelloRoute.register(fastify);
  registerAuthRoute(fastify);
  registerUserRoute(fastify);
  
  // 추가 라우트들도 여기서 등록
  // registerUsersRoute(fastify);
  // registerAuthRoute(fastify);
};