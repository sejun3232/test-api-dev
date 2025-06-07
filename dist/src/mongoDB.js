"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.client = exports.getCollection = exports.getDB = exports.disconnectMongoDB = exports.connectMongoDB = void 0;
const mongodb_1 = require("mongodb");
let client;
let db;
// MongoDB Cloud Atlas 연결 함수
const connectMongoDB = async () => {
    try {
        // 환경 변수만 사용 (기본값 없음)
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
        }
        exports.client = client = new mongodb_1.MongoClient(uri);
        // MongoDB에 연결
        await client.connect();
        // URI에서 데이터베이스명 자동 추출
        exports.db = db = client.db();
        console.log('MongoDB Atlas 연결 성공');
        // 연결 테스트
        await db.admin().ping();
        console.log('MongoDB Atlas 핑 테스트 성공');
    }
    catch (error) {
        console.error('MongoDB Atlas 연결 실패:', error);
        throw error;
    }
};
exports.connectMongoDB = connectMongoDB;
// MongoDB 연결 해제 함수
const disconnectMongoDB = async () => {
    try {
        if (client) {
            await client.close();
            console.log('MongoDB Atlas 연결 해제');
        }
    }
    catch (error) {
        console.error('MongoDB Atlas 연결 해제 실패:', error);
    }
};
exports.disconnectMongoDB = disconnectMongoDB;
// 데이터베이스 인스턴스 반환
const getDB = () => {
    if (!db) {
        throw new Error('MongoDB가 연결되지 않았습니다. connectMongoDB()를 먼저 호출하세요.');
    }
    return db;
};
exports.getDB = getDB;
// 컬렉션 가져오기 헬퍼 함수
const getCollection = (collectionName) => {
    return (0, exports.getDB)().collection(collectionName);
};
exports.getCollection = getCollection;
