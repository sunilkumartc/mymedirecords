from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, BigInteger, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
import logging
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import jwt
from config import SQLALCHEMY_DATABASE_URL, EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD
from upload import app as app1
from upload_delete import app as app2
from category_results import app as app3
from google_login import app as app4
from doctor_view import app as app5
from wati_file_process import app as app6
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Database configuration
postgres_db_URL = SQLALCHEMY_DATABASE_URL
engine = create_engine(postgres_db_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
SECRET_KEY = "mysecretkey"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configure logging
logging.basicConfig(level=logging.INFO)

# Models
class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    phone = Column(BigInteger)
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

main_app = FastAPI()

main_app.mount("/app1", app1)
main_app.mount("/app2", app2)
main_app.mount("/app3", app3)
main_app.mount("/app4", app4)
main_app.mount("/app5", app5)

# Add CORS middleware
main_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, you can specify a list of origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Serve the static files from the build/static directory
main_app.mount("/static", StaticFiles(directory="frontend/build/static"), name="static")

# API models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    phone: int
    user_type: str
    certificate_no: str = None

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    phone: int
    user_type: str
    certificate_no: str = None

# Function to send email
def send_registration_email(email: str, username: str):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Registration mymedirecords"
    message["From"] = EMAIL_USERNAME
    message["To"] = email

    text = f"""
    Dear {username},

    Thank you for registering with us.

    Warm Regards,
    Mymedirecords
    """

    part = MIMEText(text, "plain")
    message.attach(part)

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USERNAME, email, message.as_string())
        logging.info(f"Registration email sent to {email}")
    except Exception as e:
        logging.error(f"Failed to send registration email: {e}")

# Routes
@main_app.on_event("startup")
async def startup_event():
    logging.info("Connecting to PostgreSQL database...")

@main_app.post("/register/", status_code=status.HTTP_200_OK)
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

    # Send registration email
    send_registration_email(user.email, user.username)

    # Print message to console
    print(f"User registered successfully: {user.username}, {user.email}")

    # Return the registered user as UserOut model with success message
    return {
        "message": "Registered successfully",
        "user": UserOut(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            phone=db_user.phone,
            user_type=db_user.user_type,
            certificate_no=db_user.certificate_no,
        )
    }

@main_app.post("/login/", status_code=status.HTTP_200_OK)
def login_user(userLogin: UserLogin, db: Session = Depends(get_db)):
    logging.info(f"Attempting login for user: {userLogin.username_or_email}")

    # Check if username or email exists in database
    user = db.query(User).filter(
        (User.username == userLogin.username_or_email) | (User.email == userLogin.username_or_email)
    ).first()
    if not user or not pwd_context.verify(userLogin.password, user.password):
        logging.warning(f"Login failed for user: {userLogin.username_or_email}")
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    logging.info(f"User logged in successfully: {userLogin.username_or_email}")

    expires_delta = timedelta(hours=1)
    expires_at = datetime.utcnow() + expires_delta
    token_payload = {
        "sub": user.username,
        "exp": expires_at
    }
    token = jwt.encode(token_payload, SECRET_KEY, algorithm="HS256")

    # Print message to console
    print(f"User logged in successfully: {userLogin.username_or_email}")

    # Return the access token and user details
    return {
        "message": "Logged in successfully",
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut(
            id=user.id,
            username=user.username,
            email=user.email,
            phone=user.phone,
            user_type=user.user_type,
            certificate_no=user.certificate_no,
        )
    }

# Route to serve React index.html (for client-side routing)
@main_app.get("/{catchall:path}")
async def serve_react_app(catchall: str):
    return FileResponse("frontend/build/index.html")

# Optionally, serve the index.html for the root path
@main_app.get("/")
async def serve_react_root():
    return FileResponse("frontend/build/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:main_app", host="0.0.0.0", port=8000)
