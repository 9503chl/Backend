from .mypackage import module
from .model import User,UserTable
from .db import session


app = module.FastAPI()

app.add_middleware(
    module.CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    try:
        users = session.query(UserTable).all()
        user_list = []
        for user in users:
            user_list.append({
                "user_id": user.user_id,
                "student_id": user.student_id
            })
        return {"success": "true", "message": "사용자 목록 조회 성공", "users": user_list}
    except Exception as e:
        return {"success": "false", "message": str(e)}

@app.get("/download/{data_type}/{data_number}")
async def download_data(user_id: str, student_id: str, data_type: str, data_number: int = None):
    try:
        # 사용자 찾기
        user = session.query(UserTable).filter(UserTable.user_id == user_id, UserTable.student_id == student_id).first()
        if not user:
            return {"success": "false", "message": "사용자를 찾을 수 없습니다."}

        data = None
        message = ""
        file_name = ""
        
        # data_type에 따라 데이터 가져오기
        if data_type == "facial_expression":
            if data_number not in [1, 2, 3, 4]:
                return {"success": "false", "message": "잘못된 facial expression number입니다."}
            data = getattr(user, f"facial_expression_{data_number}")
            message = f"facial expression {data_number}"
            file_name = f"facial_expression_{data_number}.png"
            
        elif data_type == "material_texture":
            if data_number not in [1, 2, 3, 4, 5]:
                return {"success": "false", "message": "잘못된 material texture number입니다."}
            data = getattr(user, f"material_texture_{data_number}")
            message = f"material texture {data_number}"
            file_name = f"material_texture_{data_number}.png"
            
        elif data_type == "screenshot_image":
            data = user.screenshot_image
            message = "screenshot image"
            file_name = "screenshot.png"
            
        elif data_type == "video_file":
            data = user.video_file
            message = "video file"
            file_name = "video.mp4"
            
        else:
            raise module.HTTPException(status_code=404, detail="잘못된 데이터 타입입니다.")

        if data is None:
            raise module.HTTPException(status_code=404, detail=f"{message} 데이터가 없습니다.")

        # BLOB 데이터를 BytesIO로 변환
        file_stream = module.io.BytesIO(data)
        
        # StreamingResponse로 파일 반환
        return module.StreamingResponse(
            file_stream,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={file_name}"}
        )

    except Exception as e:
        return {"success": "false", "message": str(e)}

@app.get("/E1Get")
async def get_E1(user_id: str, student_id: str):
    try:
        # 데이터베이스에서 사용자 정보 조회
        user = session.query(UserTable).filter(UserTable.user_id == user_id, UserTable.student_id == student_id).first()
        
        # 결과가 없는 경우
        if not user:
            return {"success": "false", "message": "데이터가 없습니다."}
            
        # 사용자 정보를 딕셔너리로 변환
        user_data = {
            "user_id": str(user.user_id),
            "user_name": user.user_name,
            "student_id": user.student_id,
        }
            
        return {"success": "true", "data": user_data}
        
    except Exception as e:
        return {"success": "false", "message": str(e)}

@app.get("/E2Get")
async def get_E2(user_id: str, student_id: str, screenshot_image: module.UploadFile = module.File(...)):
    try:
        # user_id와 student_id에 해당하는 사용자 찾기
        user = session.query(UserTable).filter(UserTable.user_id == user_id & UserTable.student_id == student_id).first()
        
        if not user:
            return {"success": "false", "message": "해당 사용자를 찾을 수 없습니다."}

        # 사용자 데이터 반환
        # BLOB 데이터를 BytesIO로 변환
        file_stream = module.io.BytesIO(user.screenshot_image)
        
        return {
            "success": "true",
            "data": {
                "user_id": user.user_id,
                "user_name": user.user_name,
                "student_id": user.student_id,
                "character_type": user.character_type,
            }
        }

    except Exception as e:
        return {"success": "false", "message": str(e)}

@app.get("/E3Get")
async def get_E3(user_id: str, student_id: str):
    try:
        # user_id로 사용자 찾기
        user = session.query(UserTable).filter(
            UserTable.user_id == user_id ,
            UserTable.student_id == student_id
        ).first()

        if not user:
            return {"success": "false", "message": "해당 사용자를 찾을 수 없습니다."}

        return {
            "success": "true",
            "data": {
                "user_id": user.user_id,
                "user_name": user.user_name,
                "student_id": user.student_id,
                "character_type": user.character_type,
            }
        }

    except Exception as e:
        return {"success": "false", "message": str(e)}

@app.get("/E4Get")
async def get_E4(user_id: str, student_id: str):
    try:
        # user_id와 student_id로 사용자 찾기
        user = session.query(UserTable).filter(
            UserTable.user_id == user_id,
            UserTable.student_id == student_id
        ).first()

        if not user:
            return {"success": "false", "message": "해당 사용자를 찾을 수 없습니다."}

        return {
            "status": "success", 
            "data": {
                "user_id": user.user_id,
                "user_name": user.user_name,
                "student_id": user.student_id,
                "character_type": user.character_type,
                "friend_name": user.friend_name,
                "villain_name": user.villain_name,
                "scenario_text": user.scenario_text,
                "motion_data_1": user.motion_data_1,
                "motion_data_2": user.motion_data_2,
                "motion_data_3": user.motion_data_3,
                "motion_data_4": user.motion_data_4,
                "motion_data_5": user.motion_data_5,
            }
        }

    except Exception as e:
        return {"success": "false", "message": str(e)}

@app.get("/E5Get")
async def get_E5(user_id: str):
    try:
        # user_id로 사용자 찾기
        user = session.query(UserTable).filter(UserTable.user_id == user_id).first()
        
        if not user:
            return {"success": "false", "message": "해당 사용자를 찾을 수 없습니다."}

        return {
            "status": "success",
            "data": {
                "user_id": user.user_id,
                "user_name": user.user_name,
                "student_id": user.student_id,
                "character_type": user.character_type,
                "facial_expression_1": f"{user.facial_url_1} url",
                "scenario_text": user.scenario_text,
                "video_url": f"{user.video_url} url"
            }
        }

    except Exception as e:
        return {"success": "false", "message": str(e)}

@app.post("/test/")
async def create_test_user(user_name: str):
    try:
 
        # 랜덤 user_id 생성 (6자리 숫자)
        user_id = ''.join(module.random.choices(module.string.digits, k=6))
        
        # 랜덤 student_id 생성 (8자리 숫자)
        random_student_id = ''.join(module.random.choices(module.string.digits, k=8))
        
        # 랜덤 이름 생성 
        random_name = user_name
        
        # 테스트 사용자 데이터 생성
        test_user = UserTable(
            user_id=user_id,
            user_name=random_name,
            student_id=random_student_id,
        )

        # DB에 저장
        session.add(test_user)
        session.commit()

        return {
            "user_id": test_user.user_id,
            "student_id": test_user.student_id
        }

    except Exception as e:
        session.rollback()
        return {"success": "false", "message": str(e)}

@app.post("/E1Post/")
async def create_E1(user_id: str = module.Form(...),
                    student_id: str = module.Form(...),
                   character_type: str = module.Form(...),
                   facial_expression_1: module.UploadFile = module.File(...),
                   facial_expression_2: module.UploadFile = module.File(...),
                   facial_expression_3: module.UploadFile = module.File(...),
                   facial_expression_4: module.UploadFile = module.File(...),
                   material_texture_1: module.UploadFile = module.File(...),
                   material_texture_2: module.UploadFile = module.File(...),
                   material_texture_3: module.UploadFile = module.File(...),
                   material_texture_4: module.UploadFile = module.File(...),
                   material_texture_5: module.UploadFile = module.File(...),
                   screenshot_image: module.UploadFile = module.File(...)):
    try:
        # user_id에 해당하는 사용자 찾기
        existing_user = session.query(UserTable).filter(UserTable.user_id == user_id & UserTable.student_id == student_id).first()
        
        if not existing_user:
            return {"success": "false", "message": "해당 user_id를 찾을 수 없습니다."}

        # 기존 사용자 정보 업데이트
        existing_user.character_type = character_type
        existing_user.facial_expression_1 = facial_expression_1
        existing_user.facial_expression_2 = facial_expression_2
        existing_user.facial_expression_3 = facial_expression_3
        existing_user.facial_expression_4 = facial_expression_4
        existing_user.material_texture_1 = material_texture_1
        existing_user.material_texture_2 = material_texture_2
        existing_user.material_texture_3 = material_texture_3
        existing_user.material_texture_4 = material_texture_4
        existing_user.material_texture_5 = material_texture_5
        existing_user.screenshot_image = screenshot_image

        # DB에 변경사항 저장
        session.commit()

        return {"success": "true", "message": "데이터가 성공적으로 업데이트되었습니다."}

    except Exception as e:
        session.rollback()
        return {"success": "false", "message": str(e)}

@app.post("/E2Post/")
async def post_E2(
    user_id: str = module.Form(...),
    student_id: str = module.Form(...),
    friend_name: str = module.Form(...),
    villain_name: str = module.Form(...),
    bg_name : str = module.Form(...),
    scenario_text : str = module.Form(...)
):
    try:
        # user_id와 student_id로 기존 사용자 찾기
        existing_user = session.query(UserTable).filter(
            UserTable.user_id == user_id,
            UserTable.student_id == student_id
        ).first()

        if not existing_user:
            return {"success": "false", "message": "해당 사용자를 찾을 수 없습니다."}

        # 기존 사용자 정보 업데이트
        existing_user.friend_name = friend_name
        existing_user.villain_name = villain_name
        existing_user.bg_name = bg_name
        existing_user.scenario_text = scenario_text

        # DB에 변경사항 저장
        session.commit()

        return {"success": "true", "message": "데이터가 성공적으로 업데이트되었습니다."}

    except Exception as e:
        session.rollback()
        return {"success": "false", "message": str(e)}

@app.post("/E3Post/")
async def post_E3(user_id: str = module.Form(...), student_id: str = module.Form(...), motion_data_1: bytes = module.Form(...),
                   motion_data_2: bytes = module.Form(...), motion_data_3: bytes = module.Form(...), motion_data_4: bytes = module.Form(...), motion_data_5: bytes = module.Form(...)):
    try:
        # user_id와 student_id로 사용자 찾기
        user = session.query(UserTable).filter(
            UserTable.user_id == user_id,
            UserTable.student_id == student_id
        ).first()

        if not user:
            return {"success": "false", "message": "해당 사용자를 찾을 수 없습니다."}

        # motion data 업데이트
        user.motion_data_1 = motion_data_1
        user.motion_data_2 = motion_data_2 
        user.motion_data_3 = motion_data_3
        user.motion_data_4 = motion_data_4
        user.motion_data_5 = motion_data_5

        # DB에 변경사항 저장
        session.commit()

        return {
            "success": "true", 
            "message": "모션 데이터가 성공적으로 업데이트되었습니다.",
        }

    except Exception as e:
        session.rollback()
        return {"success": "false", "message": str(e)}

@app.post("/E4Post/")
async def post_E4(user_id: str = module.Form(...),
                  student_id: str = module.Form(...),
                   video_file: bytes = module.Form(...)):
    try:
        # user_id로 사용자 찾기
        user = session.query(UserTable).filter(UserTable.user_id == user_id, UserTable.student_id == student_id).first()
        
        if not user:
            return {"success": "false", "message": "해당 사용자를 찾을 수 없습니다."}

        # 파일 내용 읽기
        file_contents = await video_file.read()
        
        # 비디오 파일 업데이트
        user.video_file = file_contents
        
        session.commit()

        return {
            "success": "true",
            "message": "비디오 파일이 성공적으로 업로드되었습니다."
        }

    except Exception as e:
        session.rollback()
        return {"success": "false", "message": str(e)}
