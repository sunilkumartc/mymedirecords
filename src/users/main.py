from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
import logging

# Database configuration
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:admin1234@new-mymedirecords.cbs8imeeg5j7.us-east-1.rds.amazonaws.com/mymedirecords"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configure logging
logging.basicConfig(level=logging.INFO)

# Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    phone = Column(String)
    user_type = Column(String)
    certificate_no = Column(String, nullable=True)

# Create the 'users' table in PostgreSQL
Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

# API models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    phone: str
    user_type: str
    certificate_no: str = None

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    phone: str
    user_type: str
    certificate_no: str = None

# Routes
@app.on_event("startup")
async def startup_event():
    logging.info("Connecting to PostgreSQL database...")

@app.post("/register/", response_model=UserOut)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    logging.info(f"Attempting to register user: {user.username}, {user.email}")

    # Check if username or email already exists
    existing_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if existing_user:
        logging.error(f"Username {user.username} or email {user.email} already exists")
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Hash the password and create a new user
    hashed_password = pwd_context.hash(user.password)
    db_user = User(username=user.username, email=user.email, password=hashed_password,
                   phone=user.phone, user_type=user.user_type, certificate_no=user.certificate_no)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    logging.info(f"User registered successfully: {user.username}, {user.email}")

    # Return the registered user as UserOut model
    return UserOut(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        phone=db_user.phone,
        user_type=db_user.user_type,
        certificate_no=db_user.certificate_no,
    )

@app.post("/login/")
def login_user(username_or_email: str, password: str, db: Session = Depends(get_db)):
    logging.info(f"Attempting login for user: {username_or_email}")

    # Check if username or email exists in database
    user = db.query(User).filter(
        (User.username == username_or_email) | (User.email == username_or_email)
    ).first()
    if not user or not pwd_context.verify(password, user.password):
        logging.warning(f"Login failed for user: {username_or_email}")
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    logging.info(f"User logged in successfully: {username_or_email}")
    return {"message": "Login successful"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
