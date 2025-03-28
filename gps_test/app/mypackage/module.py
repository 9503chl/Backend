from fastapi import FastAPI, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import traceback

# .env 파일 로드
load_dotenv()

# 환경 변수에서 인증 정보 가져오기
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'developer_choe')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'ehdcns12!')

class Database:
    def __init__(self):
        """MongoDB 연결 초기화"""
        try:
            # 환경 변수에서 MongoDB 연결 정보 가져오기
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

# 필요한 모듈들을 한 곳에서 관리하여 재사용성을 높입니다
__all__ = [
    'FastAPI',
    'Form',
    'CORSMiddleware',
    'datetime',
    'MongoClient',
    'Depends',
    'HTTPException',
    'status',
    'HTTPBasic',
    'HTTPBasicCredentials',
    'os',
    'load_dotenv',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'Database',
    'traceback'
]