from mypackage.module import MongoClient

class Database:
    def __init__(self):
        """MongoDB 연결 초기화"""
        self.client = MongoClient("mongodb+srv://9503chl:ehdcns12!@cluster0.y86t7.mongodb.net/")
        self.db = self.client['fastapi_test']  # 데이터베이스 이름 설정
   
    def close(self):
        """MongoDB 연결 종료"""
        self.client.close()
