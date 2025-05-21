from fastapi import FastAPI, Form, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional
import os
import secrets
import traceback
import logging
from database import Database

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# .env 파일 로드
load_dotenv()

# 환경 변수에서 인증 정보 가져오기
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'developer_choe')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'ehdcns12!')

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
    'traceback',
    'File',
    'UploadFile',
    'JSONResponse',
    'RequestValidationError',
    'BaseModel',
    'Optional',
    'logging',
    'logger'
]
