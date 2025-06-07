"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const server_1 = require("./src/server");
const socket_io_1 = require("socket.io");
const start = async () => {
    try {
        const fastify = await (0, server_1.createServer)();
        // 서버 시작
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        // Socket.IO 서버 설정 (서버 시작 후)
        const io = new socket_io_1.Server(fastify.server, {
            cors: { origin: "*" }
        });
        io.on('connection', (socket) => {
            console.log('Socket.IO 연결됨:', socket.id);
            socket.on('message', (msg) => {
                console.log('받은 메시지:', msg);
                socket.emit('message', `Echo: ${msg}`);
            });
            socket.on('disconnect', () => {
                console.log('Socket.IO 연결 해제:', socket.id);
            });
        });
        fastify.log.info('Socket.IO 서버가 ws://localhost:3000 에서 실행 중입니다.');
        console.log('Socket.IO 서버 설정 완료!'); // 추가 로그
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};
start();
