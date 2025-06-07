"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerExampleRoute = registerExampleRoute;
function registerExampleRoute(fastify) {
    fastify.get('/example', async (request, reply) => {
        return { message: 'Hello, Example!' };
    });
}
