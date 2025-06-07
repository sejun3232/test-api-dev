"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloRoute = void 0;
class HelloRoute {
    static register(fastify) {
        fastify.get('/', HelloRoute.helloHandler);
    }
    static async helloHandler(request, reply) {
        return { hello: 'world' };
    }
}
exports.HelloRoute = HelloRoute;
