import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export class HelloRoute {
  static register(fastify: FastifyInstance) {
    fastify.get('/', HelloRoute.helloHandler);
  }

  static async helloHandler(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    return { hello: 'world' };
  }
}