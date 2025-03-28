from mypackage.module import (
    FastAPI, Depends, HTTPException, status,
    HTTPBasic, HTTPBasicCredentials,
    datetime, Form,
    CORSMiddleware,
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    Database
)
import secrets

app = FastAPI()
security = HTTPBasic()

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용 (실제 운영 환경에서는 특정 도메인으로 제한하는 것이 좋습니다)
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용
    allow_headers=["*"],  # 모든 HTTP 헤더 허용
)

# 사용자 인증 함수
def authenticate(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# 보호된 API
@app.get("/secure-data")
def read_secure_data(username: str = Depends(authenticate)):
    return {"message": f"Hello, {username}. 인증 성공!"}

@app.post("/position")
async def save_position(
    username: str = Depends(authenticate),
    x: str = Form(...), 
    y: str = Form(...), 
    label: str = Form(...)
):
    db = None  # db 변수를 미리 선언
    try:
        # 문자열을 float으로 변환
        try:
            x_float = float(x)
            y_float = float(y)
        except ValueError:
            return {
                "status": "error",
                "message": "x와 y 값은 숫자 형식이어야 합니다"
            }

        db = Database()  # db 초기화

        # 중복 체크: 동일한 라벨이 있는지 확인
        existing_position = db.db["positions"].find_one({
            "label": label
        })
        
        if existing_position:
            return {
                "status": "error", 
                "message": "이미 동일한 위치와 라벨이 존재합니다"
            }

        # 새로운 위치 데이터 저장
        position_data = {
            "x": x_float,
            "y": y_float,
            "timestamp": datetime.now(),
            "label": label,
            "created_by": username
        }
        
        result = db.db["positions"].insert_one(position_data)
        
        if result.inserted_id:
            return {
                "status": "success",
                "message": "위치가 성공적으로 저장되었습니다"
            }
        else:
            return {
                "status": "error",
                "message": "위치 저장에 실패했습니다"
            }
            
    except Exception as e:
        return {
            "status": "error",
            "message": f"오류가 발생했습니다: {str(e)}"
        }
    
    finally:
        if db:  # db가 None이 아닐 때만 close 호출
            db.close()

@app.get("/positions")
async def get_positions(username: str = Depends(authenticate)):
    db = None  # db 변수를 미리 선언
    try:
        db = Database()  # db 초기화
        positions = list(db.db["positions"].find({}, {"_id": 0}))
        
        if positions:
            return {
                "status": "success",
                "message": f"{username}님이 조회한 모든 위치 데이터입니다",
                "user_info": positions
            }
        else:
            return {
                "status": "success", 
                "message": "저장된 위치 데이터가 없습니다",
                "user_info": []
            }
            
    except Exception as e:
        return {
            "status": "error",
            "message": f"오류가 발생했습니다: {str(e)}"
        }
        
    finally:
        if db:  # db가 None이 아닐 때만 close 호출
            db.close()

@app.post("/delete_position")
async def delete_position(
    username: str = Depends(authenticate),
    label: str = Form(...)
):
    try:
        db = Database()
        result = db.db["positions"].delete_one({"label": label})
        
        if result.deleted_count > 0:
            return {
                "status": "success",
                "message": "위치가 성공적으로 삭제되었습니다"
            }
        else:
            return {
                "status": "error",
                "message": "해당 위치를 찾을 수 없습니다"
            }
            
    except Exception as e:
        return {
            "status": "error", 
            "message": f"오류가 발생했습니다: {str(e)}"
        }
        
    finally:
        db.close()

@app.post("/delete_all_positions")
async def delete_all_positions(
    username: str = Depends(authenticate)
):
    try:
        db = Database()
        result = db.db["positions"].delete_many({})
        
        if result.deleted_count > 0:
            return {
                "status": "success",
                "message": f"{result.deleted_count}개의 위치 데이터가 모두 삭제되었습니다"
            }
        else:
            return {
                "status": "success",
                "message": "삭제할 위치 데이터가 없습니다"
            }
            
    except Exception as e:
        return {
            "status": "error",
            "message": f"오류가 발생했습니다: {str(e)}"
        }
        
    finally:
        db.close()
