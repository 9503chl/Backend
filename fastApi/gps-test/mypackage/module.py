from fastapi import FastAPI, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import secrets
import traceback

# .env 파일 로드
load_dotenv()

# 환경 변수에서 인증 정보 가져오기
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'developer_choe')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'ehdcns12!')
