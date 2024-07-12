from fastapi import FastAPI, File, UploadFile, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import boto3
import logging
from sqlalchemy import create_engine, Column, Integer, String, DateTime, text
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

# Add CORSMiddleware to handle CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, you can specify a list of origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

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

# Queue for processing
processing_queue = queue.Queue()

# Class to manage processing pipeline
class Pipeline:
    def __init__(self):
        self.queue = processing_queue
        self.gpt_handler = GPTHandler()
        self.total_tests = None
        self.processing_results = {}

    def add_to_queue(self, patient_id: int, report_id: int, report_path_s3: str, processing_event: threading.Event):
        self.queue.put((patient_id, report_id, report_path_s3, processing_event))
        logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}, aws_path:{report_path_s3} added to queue!!")

    def start_processing(self):
        while True:
            patient_id, report_id, report_path_s3, processing_event = self.queue.get()
            logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}, aws_path:{report_path_s3} processing started!!")
            try:
                self.process(patient_id, report_id, report_path_s3)
            except Exception as e:
                logger.error(f"ERROR: Failed to process report - patient_id:{patient_id}, report_id:{report_id}, error:{str(e)}")
            finally:
                self.queue.task_done()
                processing_event.set()  # Signal that processing is complete

    def process(self, patient_id: int, report_id: int, report_path_s3: str):
        ext_path_s3 = report_path_s3.replace("reports/", "extracted_reports/").replace(".pdf", ".json")
        local_file_path = None
        json_file_path = None
        try:
            local_file_path = "/tmp/" + os.path.basename(report_path_s3)
            s3.download_file(S3_BUCKET_NAME, report_path_s3, local_file_path)
            logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: File downloaded successfully!!")

            text = read_pdf(file_path=local_file_path)
            logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: Text extraction completed!!")
            Gpt_handler = GPTHandler()
            result = Gpt_handler.extract_data(text)
            if result is None or result.get('content') == "Error":
                logger.error(f"ERROR: Error in data extraction - patient_id:{patient_id}, report_id:{report_id}:: Result ERROR!!")
                return

            json_object = json.loads(result['content'])
            json_object = add_test_status(json_object)

            json_file_path = local_file_path.replace(".pdf", ".json")
            with open(json_file_path, "w") as outfile:
                json.dump(json_object, outfile)

            s3.upload_file(json_file_path, S3_BUCKET_NAME, ext_path_s3)
            logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: Uploaded processed file to S3!!")

            db_handler = DBHandler()
            self.total_tests = db_handler.dump_test_results(patient_id=str(patient_id), report_id=report_id, results=json_object)
            logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: {self.total_tests} test values extracted and updated in DB!!")

            # Store the processing results
            self.processing_results[report_id] = {
                "patient_id": patient_id,
                "report_id": report_id,
                "report_name": report_path_s3,
                "uploaded_at": datetime.now(),
                "doctor_name": self.total_tests[1],
                "patient_name": self.total_tests[2]
            }

        except Exception as e:
            logger.error(f"ERROR: Failed to process report - patient_id:{patient_id}, report_id:{report_id}, error:{str(e)}")

        finally:
            if local_file_path and os.path.exists(local_file_path):
                os.remove(local_file_path)
            if json_file_path and os.path.exists(json_file_path):
                os.remove(json_file_path)

    def get_total_tests(self):
        return self.total_tests

    def get_processing_result(self, report_id):
        return self.processing_results.get(report_id, None)

pipeline = Pipeline()
processing_thread = threading.Thread(target=pipeline.start_processing)
processing_thread.daemon = True
processing_thread.start()

# Route to handle file upload and processing
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...), phone_number: str = Query(..., description="Phone number of the user"), background_tasks: BackgroundTasks = BackgroundTasks()):
    try:
        db = SessionLocal()
        user = db.execute(
            text("SELECT id FROM users WHERE phone = :phone_number"),
            {"phone_number": phone_number}
        ).fetchone()

        if not user:
            logging.info(f"")
            raise HTTPException(status_code=404, detail="User not found")

        patient_id = user[0]
        current_time = datetime.now().strftime("%Y%m%d%H%M%S")
        s3_key = f"{S3_REPORTS_FOLDER}{patient_id}/{current_time}_{file.filename}"

        s3.upload_fileobj(file.file, S3_BUCKET_NAME, s3_key, ExtraArgs={"Metadata": {"report_id": str(patient_id)}})
        logger.info(f"INFO: File '{file.filename}' uploaded successfully to '{S3_BUCKET_NAME}/{s3_key}'")

        new_report = Report(
            patientid=patient_id,
            reportpath=s3_key,
            uploaded_at=datetime.now(),
            is_seen=0,
            status=1,
            report_name=current_time
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)

        report_id = new_report.reportid

        processing_event = threading.Event()
        pipeline.add_to_queue(patient_id, report_id, s3_key, processing_event)
        background_tasks.add_task(pipeline.start_processing)

        return {
            "message": f"File '{file.filename}' uploaded successfully and processing has started",
            "report_id": report_id,
            "status": "processing"
        }

    except Exception as e:
        logger.error(f"ERROR: Failed to upload or process file - phone_number:{phone_number}, error:{str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload or process file")

    finally:
        db.close()


# Route to check processing status and get results
@app.get("/status/{report_id}")
async def get_report_status(report_id: int):
    result = pipeline.get_processing_result(report_id)
    if result:
        return result
    else:
        return {"message": "Processing not complete or report ID not found", "status": "processing"}

# Additional routes can be added here if needed

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
