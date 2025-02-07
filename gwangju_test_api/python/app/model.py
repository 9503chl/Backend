from .mypackage import module
from .db import Base
from .db import ENGINE

#sql과 동일하게 생성.
class UserTable(Base):
    __tablename__ = "gwangju"
    user_id = module.Column(module.Integer, primary_key=True, autoincrement=True)
    user_name = module.Column(module.String(50), nullable=False)
    student_id = module.Column(module.String(50), nullable=False)
    initial_time = module.Column(module.DateTime, nullable=False)
    character_type = module.Column(module.String(50), nullable=False)
    facial_expression_1 = module.Column(module.BLOB)
    facial_expression_2 = module.Column(module.BLOB)
    facial_expression_3 = module.Column(module.BLOB) 
    facial_expression_4 = module.Column(module.BLOB)
    material_texture_1 = module.Column(module.BLOB)
    material_texture_2 = module.Column(module.BLOB)
    screenshot_image = module.Column(module.BLOB)
    friend_name = module.Column(module.String(50))
    villain_name = module.Column(module.String(50))
    bg_name = module.Column(module.String(50))
    scenario_text = module.Column(module.String(10000))
    motion_data_1 = module.Column(module.String(50))
    motion_data_2 = module.Column(module.String(50))
    motion_data_3 = module.Column(module.String(50))
    motion_data_4 = module.Column(module.String(50))
    motion_data_5 = module.Column(module.String(50))
    video_thumbnail = module.Column(module.BLOB)
    video_file = module.Column(module.BLOB)

class User(module.BaseModel):
    model_config = module.ConfigDict(arbitrary_types_allowed=True)
    user_id: str
    user_name: str
    student_id: str
    character_type: str
    initial_time: module.datetime
    facial_expression_1: bytes
    facial_expression_2: bytes
    facial_expression_3: bytes
    facial_expression_4: bytes
    material_texture_1: bytes
    material_texture_2: bytes
    screenshot_image: bytes
    friend_name: str
    villain_name: str
    bg_name: str
    scenario_text: str
    motion_data_1: str
    motion_data_2: str
    motion_data_3: str
    motion_data_4: str
    motion_data_5: str
    video_thumbnail: bytes
    video_file: bytes
    