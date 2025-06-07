"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const logChannelSchema = new mongoose_1.Schema({
    guildID: { type: String, required: true },
    channelID: { type: String, required: true },
    eventType: { type: String, required: true }, // 예: "join", "leave", "warn" 등
    enabled: { type: Boolean, default: true },
});
const LogChannel = (0, mongoose_1.model)('LogChannel', logChannelSchema);
exports.default = LogChannel;
