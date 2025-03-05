import random
import json

from bson import ObjectId, json_util
from database import Database
from datetime import datetime

from mypackage.module import FastAPI

app = FastAPI()

# 랜덤 이름 리스트
names = ["김철수", "이영희", "박민수", "정수진", "최영민", "강지원", "윤서연", "조현우"]

@app.post("/add_user")
async def add_user():
    # 데이터베이스 연결
    db = Database()
    
    try:
        # 현재 시간과 랜덤 이름으로 데이터 생성
        data = {
            "_id": ObjectId(),
            "name": random.choice(names),
            "timestamp": datetime.now()
        }
        
        # 데이터베이스에 삽입
        result = db.db["users"].insert_one(data)
        
        # ObjectId와 datetime을 JSON 직렬화 가능한 형식으로 변환
        json_data = {
            "_id": str(data["_id"]),
            "name": data["name"],
            "timestamp": data["timestamp"].isoformat()
        }
        
        return {"message": "데이터 삽입 완료", "data": json_data}

    finally:
        # 데이터베이스 연결 종료
        db.close()

@app.get("/")
async def root():
    db = Database()
    data = db.db.users.find()
    results = []
    for doc in data:
        results.append({
            "id": str(doc["_id"]),  # ObjectId를 문자열로 변환
            "name": doc.get("name"),
            "value": doc.get("value")
            # 필요한 필드들만 추가
        })
    return results

# 또는 단일 문서를 반환할 경우
@app.get("/item/{id}")
async def get_item(id: str):
    db = Database()
    data = db.db.users.find_one({"_id": id})
    return json.loads(json_util.dumps(data))
