from mypackage.module import (
    FastAPI, Depends, HTTPException, status,
    HTTPBasic, HTTPBasicCredentials,
    datetime, Form, File, UploadFile,
    CORSMiddleware, JSONResponse, RequestValidationError,
    ADMIN_USERNAME, ADMIN_PASSWORD, Database,
    secrets, logger
)
import base64

app = FastAPI()
security = HTTPBasic()

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 422 에러 핸들러 추가
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc)}
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
    texture: str = Form(...),
    object_index: str = Form(...),
    sticker_index: str = Form(...),
    text: str = Form(...),
    x: str = Form(...),
    y: str = Form(...)
):
    db = None
    try:
        # 문자열을 float으로 변환
        try:
            x_float = float(x)
            y_float = float(y)
            object_index_int = int(object_index)
            sticker_index_int = int(sticker_index)
        except ValueError as ve:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid numeric values: {str(ve)}"
            )

        # text 값 인코딩 처리
        try:
            encoded_text = text.encode('utf-8').decode('utf-8')
        except UnicodeError as ue:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid text encoding: {str(ue)}"
            )

        db = Database()

        # 새로운 위치 데이터 저장
        position_data = {
            "texture": texture,  # 이미 base64로 인코딩된 문자열
            "object_index": object_index_int,
            "sticker_index": sticker_index_int,
            "text": encoded_text,
            "x": x_float,
            "y": y_float,
            "timestamp": datetime.now(),
            "created_by": username
        }
        
        result = db.db["positions"].insert_one(position_data)
        
        if result.inserted_id:
            return {
                "status": "success",
                "message": "Position saved successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save position"
            )
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )
    
    finally:
        if db:
            db.close()

@app.get("/positions")
async def get_positions(username: str = Depends(authenticate)):
    db = None
    try:
        db = Database()
        positions = list(db.db["positions"].find({}, {"_id": 0}))
        
        if positions:
            return {
                "status": "success",
                "message": f"All position data retrieved for {username}",
                "user_info": positions
            }
        else:
            return {
                "status": "success", 
                "message": "No position data found",
                "user_info": []
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while retrieving positions: {str(e)}"
        )
        
    finally:
        if db:
            db.close()

@app.post("/delete_position")
async def delete_position(
    username: str = Depends(authenticate),
    texture: str = Form(...),
    object_index: int = Form(...),
    sticker_index: int = Form(...)
):
    try:
        db = Database()
        result = db.db["positions"].delete_one({
            "texture": texture,
            "object_index": object_index,
            "sticker_index": sticker_index
        })
        
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
