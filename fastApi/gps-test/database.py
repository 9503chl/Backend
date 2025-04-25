from mypackage.module import MongoClient, os, load_dotenv
import traceback

class Database:
    def __init__(self):
        """MongoDB 연결 초기화"""
        try:
            # 환경 변수에서 MongoDB 연결 정보 가져오기
            load_dotenv()
            MONGO_URI = os.getenv('MONGO_URI')
            DB_NAME = os.getenv('DB_NAME')
            
            print(f"Connecting to database: {DB_NAME}")  # 디버깅용
            
            if not MONGO_URI:
                raise ValueError("MONGO_URI environment variable is not set")
                
            self.client = MongoClient(MONGO_URI)
            self.db = self.client[DB_NAME]
            
            # 연결 테스트
            self.client.server_info()
            print("MongoDB connection successful!")  # 디버깅용
            
        except Exception as e:
            print(f"MongoDB 연결 오류: {str(e)}")
            print("상세 에러:")
            print(traceback.format_exc())
            raise
   
    def close(self):
        """MongoDB 연결 종료"""
        if hasattr(self, 'client'):
            try:
                self.client.close()
                print("MongoDB connection closed")  # 디버깅용
            except Exception as e:
                print(f"Error closing MongoDB connection: {str(e)}")
