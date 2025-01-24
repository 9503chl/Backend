import sys,os,random,string,io
from datetime import datetime,timedelta
from apscheduler.schedulers.background import BackgroundScheduler

# FastAPI 관련 임포트
from fastapi import FastAPI,Form,File, UploadFile
from fastapi.responses import StreamingResponse
from typing import List
from starlette.middleware.cors import CORSMiddleware

# SQLAlchemy 관련 임포트 
from sqlalchemy import (
    Column,
    Integer, 
    String,
    BLOB,
    DateTime,
    create_engine
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import (
    sessionmaker,
    scoped_session
)

# Pydantic 관련 임포트
from pydantic import BaseModel,ConfigDict

db_userName = "root"
db_userPassword = "ehdcns12!"
mariadb_container_name = "mariadb"
db_port = "3306"
db_tableName = "edudb"