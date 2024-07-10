from fastapi import FastAPI, File, UploadFile, HTTPException, Query
import boto3
import logging
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json
import queue
import threading
import os
import time

from config import AWS_access_key_id, AWS_secret_access_key, AWS_bucket_name, REPORT_PATH, EXTRACTED_PATH, SQLALCHEMY_DATABASE_URL
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

# SQLAlchemy setup
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define the Report model
class Report(Base):
    __tablename__ = 'tblreports'
    reportid = Column(Integer, primary_key=True, index=True)
    patientid = Column(Integer)
    reportpath = Column(String)
    uploaded_at = Column(DateTime)
    is_seen = Column(Integer, default=0)  # Use Integer instead of Boolean
    doctorid = Column(Integer, nullable=True)
    seen_at = Column(DateTime, nullable=True)
    status = Column(Integer)
    doctor_name = Column(String, nullable=True)
    report_name = Column(String)
    patient_name = Column(String, nullable=True)
# Initialize Handlers
storage_handler = StorageHandler()
db_handler = DBHandler()  # Initialize DBHandler instance

# Queue for processing
processing_queue = queue.Queue()

# Class to manage processing pipeline
class Pipeline:
    def __init__(self):
        self.queue = processing_queue
        self.gpt_handler = GPTHandler()

    def add_to_queue(self, patient_id: int, report_id: int, report_path_s3: str):
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

    def process(self, patient_id: int, report_id: int, report_path_s3: str):
        # Define the paths for S3
        ext_path_s3 = report_path_s3.replace("reports/", "extracted_reports/").replace(".pdf", ".json")

        # Log the S3 key before attempting to download
        logger.info(f"INFO: Attempting to download file from S3. S3 key: {report_path_s3}")

        # Add an extended delay before attempting to download the file
        time.sleep(5)  # 5 seconds delay

        # Download report from S3
        local_file_path = None
        json_file_path = None
        try:
            local_file_path = "/tmp/" + os.path.basename(report_path_s3)
            s3.download_file(S3_BUCKET_NAME, report_path_s3, local_file_path)
            logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: File downloaded successfully!!")

            # Process the downloaded file
            text = read_pdf(file_path=local_file_path)
            logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: Text extraction completed!!")
            logger.info("PDF Parsing Started")
            Gpt_handler = GPTHandler()
            result = Gpt_handler.extract_data(text)
            if result is None or result.get('content') == "Error":
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
            # Clean up temporary local files if they exist
            if local_file_path and os.path.exists(local_file_path):
                os.remove(local_file_path)
            if json_file_path and os.path.exists(json_file_path):
                os.remove(json_file_path)



pipeline = Pipeline()
processing_thread = threading.Thread(target=pipeline.start_processing)
processing_thread.daemon = True
processing_thread.start()


# Route to handle file upload and processing
@app.post("/upload/")
async def upload_file(phone_number: str = Query(..., description="Phone number of the user"), file: UploadFile = File(...)):
    try:
        # Fetch user information from PostgreSQL by phone number
        db = SessionLocal()
        user = db.execute(
            text("SELECT id FROM users WHERE phone = :phone_number"),
            {"phone_number": phone_number}
        ).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        patient_id = user[0]
        
        # Generate the S3 key for upload
        current_time = datetime.now().strftime("%Y%m%d%H%M%S")
        s3_key = f"{S3_REPORTS_FOLDER}{patient_id}/{current_time}_{file.filename}"

        # Upload the original file to S3 with metadata
        s3.upload_fileobj(file.file, S3_BUCKET_NAME, s3_key, ExtraArgs={"Metadata": {"report_id": str(patient_id)}})
        logger.info(f"INFO: File '{file.filename}' uploaded successfully to '{S3_BUCKET_NAME}/{s3_key}'")

        # Insert a new report entry to generate report_id
        new_report = Report(
            patientid=patient_id,
            reportpath=s3_key,
            uploaded_at=datetime.now(),
            is_seen=0,  # Ensure this is an integer (0 or 1) instead of a boolean (False or True)
            status=1,
            report_name=current_time
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)

        report_id = new_report.reportid

        # Add to processing queue
        pipeline.add_to_queue(patient_id, report_id, s3_key)

        return {"message": "File uploaded successfully and added to processing queue.", "report_id": report_id}

    except Exception as e:
        logger.error(f"ERROR: Failed to upload file - error:{str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

    finally:
        db.close()



# Default route
@app.get("/")
async def read_root():
    return {"message": "Welcome to the file upload and processing service with FastAPI!"}
