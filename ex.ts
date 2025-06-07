import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export function registerExampleRoute(fastify: FastifyInstance) {
  fastify.get('/example', async (request: FastifyRequest, reply: FastifyReply) => {
    return { message: 'Hello, Example!' };
  });
}