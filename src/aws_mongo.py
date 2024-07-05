from fastapi import FastAPI, File, UploadFile, HTTPException
from config import AWS_access_key_id, AWS_secret_access_key, AWS_bucket_name
import boto3
import logging
from pymongo import MongoClient
from urllib.parse import quote_plus
from datetime import datetime

# Initialize FastAPI app
app = FastAPI()

# AWS S3 configurations
AWS_ACCESS_KEY_ID = AWS_access_key_id
AWS_SECRET_ACCESS_KEY = AWS_secret_access_key
S3_BUCKET_NAME = AWS_bucket_name
S3_REPORTS_FOLDER = 'reports/'  # Specify the folder prefix

# Initialize S3 client
s3 = boto3.client('s3',
                  aws_access_key_id=AWS_ACCESS_KEY_ID,
                  aws_secret_access_key=AWS_SECRET_ACCESS_KEY
                  )

# MongoDB connection details
url = 'mongodb://54.211.223.105:27017'
database_name = 'productDB'
collection_name = 'users'

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create a new client and connect to the server
try:
    client = MongoClient(url)
    db = client[database_name]
    collection = db[collection_name]
    logger.info("Successfully connected to MongoDB")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise

# Function to fetch email by phone number from 'upload' collection
def get_email_by_phone(phone):
    query = {"phone": phone}
    user = collection.find_one(query)
    if user:
        return user.get('userId')
    else:
        return None

# Route to handle file upload
@app.post("/upload/")
async def upload_file(phone_number: str, file: UploadFile = File(...)):
    try:
        # Get email by phone number from MongoDB 'upload' collection
        email = get_email_by_phone(phone_number)
        if not email:
            raise HTTPException(status_code=404, detail="User not found")

        # Generate the S3 key with the reports folder prefix, user_id, and date-time formatted file name
        current_time = datetime.now().strftime("%Y%m%d%H%M%S")
        s3_key = f"{S3_REPORTS_FOLDER}{email}/{current_time}_{file.filename}"

        # Upload file to S3 with the specified key
        s3.upload_fileobj(file.file, S3_BUCKET_NAME, s3_key)

        return {"message": f"File '{file.filename}' uploaded successfully to '{S3_BUCKET_NAME}/{s3_key}'"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Default route
@app.get("/")
async def read_root():
    return {"message": "Welcome to the file upload service with FastAPI!"}
