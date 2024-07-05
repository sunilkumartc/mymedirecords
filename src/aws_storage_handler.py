import boto3
from config import AWS_access_key_id, AWS_secret_access_key, AWS_bucket_name, REPORT_PATH, EXTRACTED_PATH
from botocore.exceptions import NoCredentialsError
import os


class StorageHandler:
    def __init__(self):
        self.aws_s3_client = boto3.client('s3',
                                          aws_access_key_id=AWS_access_key_id,
                                          aws_secret_access_key=AWS_secret_access_key)

    def download_from_s3(self, report_path_s3, report_path_local):
        self.aws_s3_client.download_file(AWS_bucket_name,
                                         f"reports/{report_path_s3}",
                                         f"{REPORT_PATH}/{report_path_local}")

    def upload_to_s3(self, ext_path_s3, ext_path_local, report_path_local):
        self.aws_s3_client.upload_file(f"{EXTRACTED_PATH}/{ext_path_local}",
                                       AWS_bucket_name,
                                       f"extracted_reports/{ext_path_s3}")
        file_names = [f"{REPORT_PATH}/{report_path_local}",
                      f"{EXTRACTED_PATH}/{ext_path_local}"]
        for file in file_names:
            if os.path.exists(file):
                os.remove(file)
            else:
                print("The file does not exist")
                
                
if __name__ == "__main__":
    s = StorageHandler()
    s.download_from_s3("6/report_1.pdf", "6_report_1.pdf")
