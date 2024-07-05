from fastapi import FastAPI, File, UploadFile, HTTPException
import boto3
import os

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

# Route to handle file upload
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Generate the S3 key with the reports folder prefix
        s3_key = S3_REPORTS_FOLDER + file.filename

        # Upload file to S3 with the specified key
        s3.upload_fileobj(file.file, S3_BUCKET_NAME, s3_key)

        return {"message": f"File '{file.filename}' uploaded successfully to '{S3_BUCKET_NAME}/{s3_key}'"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Default route
@app.get("/")
async def read_root():
    return {"message": "Welcome to the file upload service with FastAPI!"}
