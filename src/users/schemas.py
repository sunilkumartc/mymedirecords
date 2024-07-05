from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str  # 'patient' or 'doctor'

class User(BaseModel):
    id: int
    username: str
    email: str
    role: str

    class Config:
        from_attributes = True
