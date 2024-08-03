import random
import bcrypt
import requests
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, BigInteger, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Configuration
class Config:
    WATI_API_URL = 'https://live-mt-server.wati.io/320742'
    WATI_API_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MWE5NTVhZS02YmM4LTRjMGQtYTljZS00OTU3MzIxZTI0ZGEiLCJ1bmlxdWVfbmFtZSI6Im15bWVkaXJlY29yZHNAZ21haWwuY29tIiwibmFtZWlkIjoibXltZWRpcmVjb3Jkc0BnbWFpbC5jb20iLCJlbWFpbCI6Im15bWVkaXJlY29yZHNAZ21haWwuY29tIiwiYXV0aF90aW1lIjoiMDYvMjkvMjAyNCAxMDoxMToyMiIsImRiX25hbWUiOiJtdC1wcm9kLVRlbmFudHMiLCJ0ZW5hbnRfaWQiOiIzMjA3NDIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBRE1JTklTVFJBVE9SIiwiZXhwIjoyNTM0MDIzMDA4MDAsImlzcyI6IkNsYXJlX0FJIiwiYXVkIjoiQ2xhcmVfQUkifQ.Nw-6g96C67FmE0qw0Up6f2Bl4W-x_WsEusImImV_7IU'
    WEBSITE_LINK = 'http://mymedirecords.com'
    CHECK_USER_URL = 'http://192.168.29.25:8000/app1/check_user/'

class Settings:
    SQLALCHEMY_DATABASE_URL: str = "postgresql://postgres:admin1234@new-mymedirecords.cbs8imeeg5j7.us-east-1.rds.amazonaws.com/mymedirecords"
    SECRET_KEY: str = 'mysecretkey'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings()
config = Config()

# Database setup
engine = create_engine(settings.SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)  # Changed from hashed_password to password
    phone = Column(BigInteger, unique=True, index=True)
    user_type = Column(String)
    certificate_no = Column(String)

Base.metadata.create_all(bind=engine)

# Schemas
class UserCreate(BaseModel):
    phone: int

class UserVerify(BaseModel):
    phone: int
    otp: str

class UserUpdate(BaseModel):
    username: str
    email: str
    password: str

# Utils
otp_store = {}

def send_otp(phone: int, message: str):
    url = f"{config.WATI_API_URL}/api/v1/sendSessionMessage/{phone}?messageText={message}"
    headers = {
        "Authorization": config.WATI_API_TOKEN,
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers)
    
    print(f"Request URL: {url}")
    print(f"Request Headers: {headers}")
    print(f"Request Body: {message}")
    print(f"Response Status Code: {response.status_code}")
    print(f"Response Text: {response.text}")
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to send OTP")


def generate_otp():
    return str(random.randint(100000, 999999))

def hash_password(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

def create_user(db: Session, phone: int, username: str, email: str, password: str):
    hashed_password = hash_password(password)
    db_user = User(phone=phone, username=username, email=email, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_otp(phone: int):
    otp = generate_otp()
    expiry_time = datetime.utcnow() + timedelta(minutes=5)
    otp_store[phone] = {'otp': otp, 'expires': expiry_time}
    send_otp(phone, f"Your OTP is {otp}")
    return otp

def verify_otp(phone: int, otp: str):
    if phone in otp_store:
        otp_info = otp_store[phone]
        if otp_info['otp'] == otp and datetime.utcnow() < otp_info['expires']:
            del otp_store[phone]
            return True
    return False

# FastAPI app
app = FastAPI()

@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.phone == user.phone).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    create_otp(user.phone)
    return {"message": "OTP sent to your WhatsApp"}

@app.post("/verify_signup")
def verify_signup(user: UserVerify, db: Session = Depends(get_db)):
    if verify_otp(user.phone, user.otp):
        return {"message": "Please provide your username, email, and password"}
    else:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

@app.post("/update_user")
def update_user(user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.phone == user.phone).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")
    db_user.username = user.username
    db_user.email = user.email
    db_user.password = hash_password(user.password)  # Save the hashed password
    db.commit()
    db.refresh(db_user)
    return {"message": "User details updated successfully"}

@app.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.phone == user.phone).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="You should sign up before logging in")
    create_otp(user.phone)
    return {"message": "OTP sent to your WhatsApp"}

@app.post("/verify_login")
def verify_login(user: UserVerify, db: Session = Depends(get_db)):
    if verify_otp(user.phone, user.otp):
        return {"message": "Logged in successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
