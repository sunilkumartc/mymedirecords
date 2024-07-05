from fastapi import FastAPI, HTTPException, Body
import json
import os
from aws_storage_handler import StorageHandler
from aws_db_handler import DBHandler
from gpt_handler import GPTHandler
from utils import read_pdf,read_pdf2, add_test_status
from config import REPORT_PATH, EXTRACTED_PATH
from log import logger
import queue
import threading
import jwt
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


class ReportInput:
    def __init__(self, patient_id: int, report_id: int, report_path_s3: str):
        self.patient_id = patient_id
        self.report_id = report_id
        self.report_path_s3 = report_path_s3


class Pipeline:
    def __init__(self):
        self.s3_handler = StorageHandler()
        self.db_handler = DBHandler()
        self.gpt_handler = GPTHandler()
        self.queue = queue.Queue()

    def add_to_queue(self, patient_id, report_id, report_path_s3):
        self.queue.put((patient_id, report_id, report_path_s3))
        logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}, aws_path:{report_path_s3} added to queue!!")

    def start_processing(self):
        while True:
            patient_id, report_id, report_path_s3 = self.queue.get()
            logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}, aws_path:{report_path_s3} processing started!!")
            try:
                output = self.process(patient_id, report_id, report_path_s3)
                logger.info(f"OUTPUT:{output} for patient_id:{patient_id}, report_id: {report_id}, report_path_s3:{report_path_s3}")
            except Exception as e:
                logger.error(f"ERROR: Failed to process report - patient_id:{patient_id}, report_id:{report_id}, "
                             f"error:{str(e)}")
            finally:
                self.queue.task_done()

    def process(self, patient_id, report_id, report_path_s3):
        report_path_local = report_path_s3.replace("/", "_")
        ext_path_local = report_path_local.replace(".pdf", ".json")
        ext_path_s3 = report_path_s3.replace(".pdf", ".json")

        # download report
        self.s3_handler.download_from_s3(report_path_s3=report_path_s3,
                                         report_path_local=report_path_local)
        logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: File downloaded!!")
        file_path = "test1.pdf"
        project_id = "model-overview-221912"
        location = "us"  # Processor location
        processor_id = "8b4f20e83e29fb7f"
        #data1 = read_pdf1(file_path, project_id, location, processor_id)
        #text = read_pdf2(project_id, location, processor_id, file_path=f"{REPORT_PATH}/{report_path_local}" )
        # Extract text
        text = read_pdf(file_path=f"{REPORT_PATH}/{report_path_local}")
        logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: Text extraction completed!!")

        # extract parameters
        result = self.gpt_handler.extract_data(text[0])
        if result['content'] == "Error":
            logger.error(f"ERROR: ERROR, patient_id:{patient_id}, report_id:{report_id}:: Result EROOR!!")
            return 0
        logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: Result Generated!!")

        # upload json
        json_object = json.loads(result['content'])
        json_object = add_test_status(json_object)
        json_file_name = f"{EXTRACTED_PATH}/{ext_path_local}"
        with open(json_file_name, "w") as outfile:
            json.dump(json_object, outfile)
        
        self.s3_handler.upload_to_s3(ext_path_s3=ext_path_s3,
                                     ext_path_local=ext_path_local,
                                     report_path_local=report_path_local)
        logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: Uploaded file on S3!!")

        # update db
        total_test = self.db_handler.dump_test_results(patient_id=patient_id,
                                                       report_id=report_id,
                                                       results=json_object)
        logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: {total_test} test values extracted!!")
        logger.info(f"INFO: patient_id:{patient_id}, report_id:{report_id}:: Updated status in DB!!")
        return 1


pipeline = Pipeline()
processing_thread = threading.Thread(target=pipeline.start_processing)
processing_thread.daemon = True
processing_thread.start()


@app.post("/process_reports")
async def process_reports(patient_id, report_id, report_path_s3):
    pipeline.add_to_queue(patient_id, report_id, report_path_s3)
    return 200 #{"message": "Request added to the processing queue."}



origins = {
    "http://localhost",
    "http://localhost:3000",
}

SECERT_KEY = "YOUR_FAST_API_SECRET_KEY"
ALGORITHM ="HS256"
ACCESS_TOKEN_EXPIRES_MINUTES = 800

test_user = {
   "username": "temitope",
    "password": "temipassword",

}

class LoginItem(BaseModel):
    username: str
    password: str

    @app.get("/")
    def read_root():
     return {"Hello": "World"}

app.add_middleware(
   CORSMiddleware,
    allow_origins = origins,
    allow_credentials =True,
    allow_methods = ["*"],
    allow_headers= ["*"],
)

@app.post("/login")
async def user_login(loginitem:LoginItem):


    data = jsonable_encoder(loginitem)

    if data['username']== test_user['username'] and data['password']== test_user['password']:

        encoded_jwt = jwt.encode(data, SECERT_KEY, algorithm=ALGORITHM)
        return {"token": encoded_jwt}

    else:
        return {"message":"login failed"}
