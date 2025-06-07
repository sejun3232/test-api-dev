"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCatsRoute = registerCatsRoute;
function registerCatsRoute(fastify) {
    fastify.get('/cats', async () => {
        return [{ name: 'Nabi' }, { name: 'Yaong' }];
    });
}
