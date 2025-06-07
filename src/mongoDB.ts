import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

// MongoDB Cloud Atlas 연결 함수
export const connectMongoDB = async (): Promise<void> => {
  try {
    // 환경 변수만 사용 (기본값 없음)
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
    }

    client = new MongoClient(uri);
    
    // MongoDB에 연결
    await client.connect();
    
    // URI에서 데이터베이스명 자동 추출
    db = client.db();
    
    console.log('MongoDB Atlas 연결 성공');
    
    // 연결 테스트
    await db.admin().ping();
    console.log('MongoDB Atlas 핑 테스트 성공');
    
  } catch (error) {
    console.error('MongoDB Atlas 연결 실패:', error);
    throw error;
  }
};

// MongoDB 연결 해제 함수
export const disconnectMongoDB = async (): Promise<void> => {
  try {
    if (client) {
      await client.close();
      console.log('MongoDB Atlas 연결 해제');
    }
  } catch (error) {
    console.error('MongoDB Atlas 연결 해제 실패:', error);
  }
};

// 데이터베이스 인스턴스 반환
export const getDB = (): Db => {
  if (!db) {
    throw new Error('MongoDB가 연결되지 않았습니다. connectMongoDB()를 먼저 호출하세요.');
  }
  return db;
};

// 컬렉션 가져오기 헬퍼 함수
export const getCollection = (collectionName: string) => {
  return getDB().collection(collectionName);
};

export { client, db };