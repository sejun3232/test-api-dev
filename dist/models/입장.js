"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const 입장로그Schema = new mongoose_1.Schema({
    guildID: { type: String, required: true }, // 서버 ID
    channelID: { type: String, required: true }, // 로그를 기록할 채널 ID
    eventType: { type: String, required: true },
    enabled: { type: Boolean, default: false }, // 로그 기능 활성화 여부
});
const 입장로그 = (0, mongoose_1.model)("입장로그", 입장로그Schema);
exports.default = 입장로그;
