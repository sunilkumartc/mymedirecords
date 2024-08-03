from flask import Flask, request, jsonify
import requests
import logging
import tempfile
import os
from config import Config
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)

# Configure logging
logging.basicConfig(level=logging.INFO)

def send_message(phone_number, message):
    url = f"{app.config['WATI_API_URL']}/api/v1/sendSessionMessage/{phone_number}?messageText={message}"
    headers = {
        "Authorization": app.config['WATI_API_TOKEN'],
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers)
    logging.info(f"Message sent response: {response.status_code}, {response.text}")
    if response.status_code != 200:
        logging.error(f"Failed to send message: {response.status_code}, {response.text}")

@app.route('/', methods=['POST'])
def webhook():
    data = request.json
    logging.info(f"Incoming message: {data}")

    response_data = {'status': 'success', 'file_name': None}

    if data.get('type') == 'document':
        phone_number = data.get('waId')
        logging.info(f"Phone number: {phone_number}")

        # Extract the last 10 digits of the phone number
        phone_number_last_10_digits = phone_number[-10:]
        logging.info(f"Phone number (last 10 digits): {phone_number_last_10_digits}")

        # Check if the user exists in the database
        user_response = requests.get(f"{app.config['CHECK_USER_URL']}{phone_number_last_10_digits}")
        logging.info(f"User check response status code: {user_response.status_code}")

        if user_response.status_code == 404:
            send_message(phone_number, f"your phone number not registered in our website. Please register at {app.config['WEBSITE_LINK']} and upload files.")
        else:
            document_url = data.get('data')
            try:
                # Extract the file name from the document URL
                file_name = document_url.split('/')[-1]
                response_data['file_name'] = file_name

                # Construct the media URL with the correct format
                media_url = f"{app.config['WATI_MEDIA_URL']}{file_name}"
                logging.info(f"Attempting to retrieve media file from URL: {media_url}")

                # Download the file using the media URL
                media_response = requests.get(media_url, headers={"Authorization": f"{app.config['WATI_API_TOKEN']}"})
                logging.info(f"Media response status code: {media_response.status_code}")

                if media_response.status_code == 200:
                    # Save the file to a temporary location
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                        temp_file.write(media_response.content)
                        temp_file_path = temp_file.name
                        logging.info(f"File saved temporarily at: {temp_file_path}")

                    try:
                        # Placeholder for upload file functionality
                        logging.info(f"Simulating file upload to FastAPI endpoint")

                        # Simulate a successful upload
                        upload_response_status_code = 200  # Simulate a successful upload
                        if upload_response_status_code == 200:
                            logging.info(f"File uploaded successfully")
                            send_message(phone_number, f"Your file is being processed. Please wait a few minutes. You can view your results here {app.config['WEBSITE_LINK']}.")
                        else:
                            logging.error(f"Failed to upload file: {upload_response_status_code}")
                            send_message(phone_number, "Failed to process your file. Please try again later.")

                    finally:
                        # Remove the temporary file
                        os.remove(temp_file_path)
                        logging.info(f"Temporary file removed: {temp_file_path}")

                else:
                    logging.error(f"Failed to retrieve media file: {media_response.status_code}, {media_response.text}")
                    send_message(phone_number, "Failed to retrieve your file. Please try again later.")

            except Exception as e:
                logging.error(f"Exception occurred while handling the document: {str(e)}")
                send_message(phone_number, "An error occurred while processing your file. Please try again later.")

    return jsonify(response_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
