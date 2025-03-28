from mypackage.module import (
    FastAPI, 
    hashlib, datetime, Form,
    CORSMiddleware,
    BackgroundScheduler,
    IntervalTrigger,
    timedelta
)
from database import Database
from model import Model

app = FastAPI()

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용 (실제 운영 환경에서는 특정 도메인으로 제한하는 것이 좋습니다)
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용
    allow_headers=["*"],  # 모든 HTTP 헤더 허용
)

# 스케줄러용 동기 함수 추가
def scheduled_delete():
    db = Database()
    try:
        current_time = datetime.now()
        result = db.db["users"].delete_many({
            "timestamp": {
                "$lt": current_time - timedelta(days=7)
            }
        })
        print(f"{result.deleted_count}개의 오래된 데이터가 삭제되었습니다.")
    finally:
        db.close()

# 스케줄러 설정 수정
scheduler = BackgroundScheduler()
scheduler.add_job(
    scheduled_delete,  # 동기 함수 사용
    IntervalTrigger(days=1),
    id='delete_old_data',
    name='데이터 자동 삭제',
    replace_existing=True
)

scheduler.start()

@app.post("/delete_all_users")
async def delete_all_users():
    db = Database()
    
    try:
        result = db.db["users"].delete_many({})
        deleted_count = result.deleted_count
        
        return {
            "message": "모든 사용자 데이터가 삭제되었습니다",
            "deleted_count": f"{deleted_count}개의 데이터가 삭제되었습니다."
        }
        
    finally:
        db.close()

@app.get("/get_all_users")
async def get_all_users():
    db = Database()
    
    try:
        users = list(db.db["users"].find())
        
        # ObjectId를 문자열로 변환하고 timestamp를 ISO 형식으로 변환
        formatted_users = []
        for user in users:
            formatted_user = {
                "_id": str(user["_id"]),
                "user_info": user["user_info"],
                "timestamp": user["timestamp"].isoformat()
            }
            formatted_users.append(formatted_user)
            
        return {
            "message": "모든 사용자 데이터를 가져왔습니다",
            "data": formatted_users,
        }
        
    finally:
        db.close()

@app.get("/create_user")
async def create_user(user_info: str):
    db = Database()
    try:
        # user_info 해싱
        hashed_user_info = hashlib.sha256(user_info.encode()).hexdigest()
        
        # 새로운 사용자 데이터 생성
        new_user_data = {
            "user_info": hashed_user_info,
            "timestamp": datetime.now()
            # 다른 초기 필드들도 여기에 추가
        }
        
        result = db.db["users"].insert_one(new_user_data)
        
        return {
            "message": "새로운 사용자가 생성되었습니다",
            "user_info": hashed_user_info
        }
    finally:
        db.close()

@app.get("/E1Get")
async def E1Get(user_info: str):
    # user_info를 언해싱
    unhashed_user_info = hashlib.sha256(user_info.encode()).hexdigest()
    db = Database()
    json_data = Model()
    try:
        user = db.db["users"].find_one({"user_info": unhashed_user_info})

        if(user is None):
            # db.db["users"].insert_one(json_data)
            return await create_user(user_info)

        json_data.timestamp = user["timestamp"]

        return json_data
    finally:
        db.close()

@app.post("/E1Post")
async def E1Post(facial_expression_1: bytes = Form(...),
                facial_expression_2: bytes = Form(...),
                facial_expression_3: bytes = Form(...),
                facial_expression_4: bytes = Form(...),
                facial_expression_5: bytes = Form(...),
                material_texture_1: bytes = Form(...),
                material_texture_2: bytes = Form(...),
                user_info: str = Form(...)):
    db = Database()
    try:
        unhashed_user_info = hashlib.sha256(user_info.encode()).hexdigest()
        user = db.db["users"].find_one({"user_info": unhashed_user_info})

        if user is None:
            return {"error": "사용자 정보가 존재하지 않습니다."}

        # 업데이트할 데이터를 명시적으로 지정
        update_data = {
            "facial_expression1_url": facial_expression_1,
            "facial_expression2_url": facial_expression_2,
            "facial_expression3_url": facial_expression_3,
            "facial_expression4_url": facial_expression_4,
            "facial_expression5_url": facial_expression_5,
            "material_texture1_url": material_texture_1,
            "material_texture2_url": material_texture_2,
            "timestamp": datetime.now()
        }

        # 명시적으로 지정한 필드만 업데이트
        db.db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": update_data}
        )

        return {"message": "업데이트 성공"}

    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()

@app.post("/E2Post")
async def E1Post(
                friend_name: str = Form(...),
                villain_name: str = Form(...),
                bg_name: str = Form(...),
                scenario_text: str = Form(...),
                user_info: str = Form(...)):
    db = Database()
    try:
        unhashed_user_info = hashlib.sha256(user_info.encode()).hexdigest()
        user = db.db["users"].find_one({"user_info": unhashed_user_info})

        if user is None:
            return {"error": "사용자 정보가 존재하지 않습니다."}

        # 업데이트할 데이터를 명시적으로 지정
        update_data = {
            "friend_name": friend_name,
            "villain_name": villain_name,
            "bg_name": bg_name,
            "scenario_text": scenario_text,
            "timestamp": datetime.now()
        }

        # 명시적으로 지정한 필드만 업데이트
        db.db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": update_data}
        )

        return {"message": "업데이트 성공"}

    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()

@app.post("/E3Post")
async def E1Post(
                motion_data_1: bytes = Form(...),
                motion_data_2: bytes = Form(...),
                motion_data_3: bytes = Form(...),
                motion_data_4: bytes = Form(...),
                motion_data_5: bytes = Form(...),
                user_info: str = Form(...)):
    db = Database()
    try:
        unhashed_user_info = hashlib.sha256(user_info.encode()).hexdigest()
        user = db.db["users"].find_one({"user_info": unhashed_user_info})

        if user is None:
            return {"error": "사용자 정보가 존재하지 않습니다."}

        # 업데이트할 데이터를 명시적으로 지정
        update_data = {
            "motion_data1": motion_data_1,
            "motion_data2": motion_data_2,
            "motion_data3": motion_data_3,
            "motion_data4": motion_data_4,
            "motion_data5": motion_data_5,
            "timestamp": datetime.now()
        }

        # 명시적으로 지정한 필드만 업데이트
        db.db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": update_data}
        )

        return {"message": "업데이트 성공"}

    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()


@app.post("/E4Post")
async def E1Post(
                video_file: bytes = Form(...),
                video_thumbnail: bytes = Form(...),
                user_info: str = Form(...)):
    db = Database()
    try:
        unhashed_user_info = hashlib.sha256(user_info.encode()).hexdigest()
        user = db.db["users"].find_one({"user_info": unhashed_user_info})

        if user is None:
            return {"error": "사용자 정보가 존재하지 않습니다."}

        # 업데이트할 데이터를 명시적으로 지정
        update_data = {
            "video_file_url": video_file,
            "video_thumbnail_url": video_thumbnail,
            "timestamp": datetime.now()
        }

        # 명시적으로 지정한 필드만 업데이트
        db.db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": update_data}
        )

        return {"message": "업데이트 성공"}

    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()
