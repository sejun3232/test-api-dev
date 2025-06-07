"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Warning = (0, mongoose_1.model)("경고", new mongoose_1.Schema({
    guildID: String,
    userID: String,
    count: Number,
}));
exports.default = Warning;
