from fastapi import FastAPI, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from google.oauth2 import id_token
from fastapi.middleware.cors import CORSMiddleware
from google.auth.transport import requests
from config import settings
from models import User as UserModel
from utils import create_access_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins; customize as needed
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Google sign-up and login
@app.post("/google-signup-login")
async def google_signup_login(id_token: str = Query(...), db: Session = Depends(get_db)):
    try:
        # Log or print the received token for debugging
        print(f"Received ID Token: {id_token}")
        user_info = verify_google_token(id_token)
    except Exception as e:
        print(f"Error verifying token: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
    
    email = user_info["email"]
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        user = UserModel(
            username=user_info["name"],
            email=email,
            phone=user_info.get("phone_number", ""),  # Ensure phone_number is provided
            user_type="patient"  # or based on your criteria
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

# Function to verify Google token
def verify_google_token(token: str):
    try:
        # Specify the CLIENT_ID of the app that accesses the backend:
        CLIENT_ID = settings.GOOGLE_CLIENT_ID
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        # ID token is valid. Get the user's Google Account ID from the decoded token.
        return {
            "sub": idinfo["sub"],
            "name": idinfo["name"],
            "email": idinfo["email"],
            "picture": idinfo["picture"],
            "phone_number": idinfo.get("phone_number")
        }
    except ValueError as e:
        # Invalid token
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")




from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User as UserModel

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/update-user/{user_id}")
async def update_user(user_id: int, username: str = None, phone: str = None, certificate_no: str = None, db: Session = Depends(get_db)):
    # Fetch the user record by ID
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Check for duplicate usernames
    if username:
        existing_user = db.query(UserModel).filter(UserModel.username == username).first()
        if existing_user and existing_user.id != user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
        
        # Update username
        user.username = username

    # Update phone number if provided
    if phone:
        user.phone = phone

    # Update certificate number if provided
    if certificate_no:
        user.certificate_no = certificate_no
    
    db.commit()
    db.refresh(user)
    
    return {"message": "User updated successfully", "user": user}

