"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const hello_route_1 = require("../routes/hello.route");
const cats_route_1 = require("../routes/cats.route");
const registerRoutes = (fastify) => {
    // 모든 라우트 등록
    hello_route_1.HelloRoute.register(fastify);
    (0, cats_route_1.registerCatsRoute)(fastify);
    // 추가 라우트들도 여기서 등록
    // registerUsersRoute(fastify);
    // registerAuthRoute(fastify);
};
exports.registerRoutes = registerRoutes;
