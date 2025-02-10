 import { MongoClient } from 'mongodb';
 
const DB_PASSWORD = 'ehdcns12!';
const uri = `mongodb+srv://9503chl:${DB_PASSWORD}@cluster0.y86t7.mongodb.net/gwangju?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri);

export async function connectDB(dbName: string) {
  try {
    await client.connect();
    console.log(`MongoDB ${dbName} 데이터베이스에 성공적으로 연결되었습니다.`);

    return client.db(dbName);

  } catch (error) {
    console.error('MongoDB gwangju 데이터베이스 연결 중 오류가 발생했습니다:', error);
    throw error;
  }
}

export async function disconnectDB() {
  try {
    await client.close();
    console.log('MongoDB gwangju 데이터베이스 연결이 종료되었습니다.');
  } catch (error) {
    console.error('MongoDB gwangju 데이터베이스 연결 종료 중 오류가 발생했습니다:', error);
    throw error;
  }
}

// 데이터베이스 연결 상태 확인
export async function pingDB() {
  try {
    await client.db('gwangju').command({ ping: 1 });
    console.log('MongoDB gwangju 데이터베이스 연결이 정상적으로 작동 중입니다.');
    return true;
  } catch (error) {
    console.error('MongoDB gwangju 데이터베이스 연결 상태 확인 중 오류가 발생했습니다:', error);
    return false;
  }
}
