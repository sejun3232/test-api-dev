"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = void 0;
const fastify_1 = __importDefault(require("fastify"));
const socket_io_1 = require("socket.io");
const redisclient_1 = require("./redisclient");
const mongoDB_1 = require("./mongoDB");
const routes_1 = require("./routes");
const createServer = async () => {
    const fastify = (0, fastify_1.default)({
        logger: true
    });
    // 라우트 등록
    (0, routes_1.registerRoutes)(fastify);
    // MongoDB 연결
    await (0, mongoDB_1.connectMongoDB)();
    // Redis 연결
    await (0, redisclient_1.connectRedis)();
    // Socket.IO 설정
    const io = new socket_io_1.Server(fastify.server, {
        cors: { origin: "*" }
    });
    io.on('connection', (socket) => {
        console.log('Socket.IO 연결됨:', socket.id);
        socket.on('message', async (msg) => {
            console.log('받은 메시지:', msg);
            await redisclient_1.redisClient.set(`message:${socket.id}`, msg);
            socket.emit('message', `Echo: ${msg}`);
        });
        socket.on('disconnect', () => {
            console.log('Socket.IO 연결 해제:', socket.id);
        });
    });
    return fastify;
};
exports.createServer = createServer;
