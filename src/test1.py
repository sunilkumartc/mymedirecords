from fastapi import FastAPI, File, UploadFile, HTTPException, Query
import boto3
import logging
from pymongo import MongoClient
from datetime import datetime
import json
import queue
import threading
import os
import time

from config import AWS_access_key_id, AWS_secret_access_key, AWS_bucket_name, REPORT_PATH, EXTRACTED_PATH
from aws_storage_handler import StorageHandler
from aws_db_handler import DBHandler
from gpt_handler import GPTHandler
from utils import read_pdf, add_test_status
from log import logger

app = FastAPI()

# AWS S3 configurations
AWS_ACCESS_KEY_ID = AWS_access_key_id
AWS_SECRET_ACCESS_KEY = AWS_secret_access_key
S3_BUCKET_NAME = AWS_bucket_name
S3_REPORTS_FOLDER = 'reports/'  # Original reports folder
S3_EXTRACTED_REPORTS_FOLDER = 'extracted_reports/'  # Processed reports folder

# Initialize S3 client
s3 = boto3.client('s3',
                  aws_access_key_id=AWS_ACCESS_KEY_ID,
                  aws_secret_access_key=AWS_SECRET_ACCESS_KEY)

# MongoDB connection details
MONGO_URL = 'mongodb://54.211.223.105:27017'
DATABASE_NAME = 'productDB'
COLLECTION_NAME = 'users'

# Initialize MongoDB client with logging
try:
    mongo_client = MongoClient(MONGO_URL)
    db = mongo_client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    logger.info("INFO: Successfully connected to MongoDB.")
except Exception as e:
    logger.error(f"ERROR: Failed to connect to MongoDB - {str(e)}")

# Initialize Handlers
storage_handler = StorageHandler()
db_handler = DBHandler()
gpt_handler = GPTHandler()

# Queue for processing
processing_queue = queue.Queue()

# Class to handle report input
class ReportInput:
    def __init__(self, patient_id: str, report_id: str, report_path_s3: str):
        self.patient_id = patient_id
        self.report_id = report_id
        self.report_path_s3 = report_path_s3

# Class to manage processing pipeline
class Pipeline:
    def __init__(self):
        self.queue = processing_queue

    def add_to_queue(self, patient_id: str, report_id: str, report_path_s3: str):
        self.queue.put((patient_id, report_id, report_path_s3))
        logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}, aws_path:{report_path_s3} added to queue!!")

    def start_processing(self):
        while True:
            patient_id, report_id, report_path_s3 = self.queue.get()
            logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}, aws_path:{report_path_s3} processing started!!")
            try:
                self.process(patient_id, report_id, report_path_s3)
            except Exception as e:
                logger.error(f"ERROR: Failed to process report - patient_id:{patient_id}, report_id:{report_id}, error:{str(e)}")
            finally:
                self.queue.task_done()

    def process(self, patient_id: str, report_id: str, report_path_s3: str):
        # Define the paths for S3
        ext_path_s3 = report_path_s3.replace("reports/", "extracted_reports/").replace(".pdf", ".json")

        # Log the S3 key before attempting to download
        logger.info(f"INFO: Attempting to download file from S3. S3 key: {report_path_s3}")

        # Add an extended delay before attempting to download the file
        time.sleep(5)  # 5 seconds delay

        # Download report from S3
        try:
            local_file_path = "/tmp/" + os.path.basename(report_path_s3)
            s3.download_file(S3_BUCKET_NAME, report_path_s3, local_file_path)
            logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: File downloaded successfully!!")
        except Exception as e:
            logger.error(f"ERROR: Failed to download file from S3 - patient_id:{patient_id}, report_id:{report_id}, error:{str(e)}")
            return

        # Process the downloaded file
        try:
            text = read_pdf(file_path=local_file_path)
            logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: Text extraction completed!!")
            logger.info("PDF Parsing Started")
            result = gpt_handler.extract_data(text)
            if result['content'] == "Error":
                logger.error(f"ERROR: Error in data extraction - patient_id:{patient_id}, report_id:{report_id}:: Result ERROR!!")
                return

            # Add additional processing if needed
            json_object = json.loads(result['content'])
            json_object = add_test_status(json_object)

            # Save processed JSON to a temporary local file
            json_file_path = local_file_path.replace(".pdf", ".json")
            with open(json_file_path, "w") as outfile:
                json.dump(json_object, outfile)

            # Upload processed JSON to S3 in the `extracted_reports` folder
            s3.upload_file(json_file_path, S3_BUCKET_NAME, ext_path_s3)
            logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: Uploaded processed file to S3!!")

            # Update database with processed results
            total_tests = db_handler.dump_test_results(patient_id=str(patient_id),
                                                       report_id=report_id,
                                                       results=json_object)
            logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: {total_tests} test values extracted and updated in DB!!")

        except Exception as e:
            logger.error(f"ERROR: Failed to process report - patient_id:{patient_id}, report_id:{report_id}, error:{str(e)}")
        finally:
            # Clean up temporary local files
            os.remove(local_file_path)
            os.remove(json_file_path)

pipeline = Pipeline()
processing_thread = threading.Thread(target=pipeline.start_processing)
processing_thread.daemon = True
processing_thread.start()

# Route to handle file upload and processing
@app.post("/upload/")
async def upload_file(phone_number: str = Query(..., description="Phone number of the user"), file: UploadFile = File(...)):
    try:
        # Get email by phone number from MongoDB 'users' collection
        user = collection.find_one({"phone": phone_number})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Construct patient_id and report_id based on user's _id and current timestamp
        patient_id = str(user.get('_id'))
        current_time = datetime.now().strftime("%Y%m%d%H%M%S")
        report_id = f"{patient_id}_{current_time}"

        # Generate the S3 key for upload
        s3_key = f"{S3_REPORTS_FOLDER}{patient_id}/{current_time}_{file.filename}"

        # Upload the original file to S3 with metadata
        s3.upload_fileobj(file.file, S3_BUCKET_NAME, s3_key, ExtraArgs={"Metadata": {"report_id": report_id}})
        logger.info(f"INFO: File '{file.filename}' uploaded successfully to '{S3_BUCKET_NAME}/{s3_key}'")

        # Add to processing queue
        pipeline.add_to_queue(patient_id, report_id, s3_key)

        return {"message": "File uploaded successfully and added to processing queue.", "report_id": report_id}

    except Exception as e:
        logger.error(f"ERROR: Failed to upload file - error:{str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Default route
@app.get("/")
async def read_root():
    return {"message": "Welcome to the file upload and processing service with FastAPI!"}
