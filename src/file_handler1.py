from fastapi import FastAPI, File, UploadFile, HTTPException
import boto3
import os
import logging
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from urllib.parse import quote_plus
from datetime import datetime

# Initialize FastAPI app
app = FastAPI()

# AWS S3 configurations
AWS_ACCESS_KEY_ID = 'AKIAS3DOCB27QHMT5LBL'
AWS_SECRET_ACCESS_KEY = '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'
S3_BUCKET_NAME = 'mymedirecords'
S3_REPORTS_FOLDER = 'reports/'  # Specify the folder prefix

# Initialize S3 client
s3 = boto3.client('s3',
                  aws_access_key_id=AWS_ACCESS_KEY_ID,
                  aws_secret_access_key=AWS_SECRET_ACCESS_KEY
                  )

# MongoDB connection details
username = "Vinayaka"
password = "Mitron@123"
escaped_username = quote_plus(username)
escaped_password = quote_plus(password)
uri = f"mongodb+srv://{escaped_username}:{escaped_password}@mymedirecord.43breqz.mongodb.net/?retryWrites=true&w=majority&appName=Mymedirecord"
database_name = "medi_report"
collection_name = "users"

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Function to fetch user_id by phone number
def get_user_id_by_phone(phone_number):
    db = client[database_name]
    collection = db[collection_name]
    query = {"phone_number": phone_number}
    user = collection.find_one(query)
    if user:
        return user.get("user_id")
    else:
        return None

# Route to handle file upload
@app.post("/upload/")
async def upload_file(phone_number: str, file: UploadFile = File(...)):
    try:
        # Get user ID by phone number
        phone_number='7411087409'
        user_id = get_user_id_by_phone(phone_number)
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found")

        # Generate the S3 key with the reports folder prefix, user_id, and date-time formatted file name
        current_time = datetime.now().strftime("%Y%m%d%H%M%S")
        s3_key = f"{S3_REPORTS_FOLDER}{user_id}/{current_time}_{file.filename}"

        # Upload file to S3 with the specified key
        s3.upload_fileobj(file.file, S3_BUCKET_NAME, s3_key)

        return {"message": f"File '{file.filename}' uploaded successfully to '{S3_BUCKET_NAME}/{s3_key}'"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Default route
@app.get("/")
async def read_root():
    return {"message": "Welcome to the file upload service with FastAPI!"}
