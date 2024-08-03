from flask import Flask, request, jsonify
import requests
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)

# WATI API endpoint and token
WATI_API_URL = "https://live-mt-server.wati.io/320742"
WATI_API_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MWE5NTVhZS02YmM4LTRjMGQtYTljZS00OTU3MzIxZTI0ZGEiLCJ1bmlxdWVfbmFtZSI6Im15bWVkaXJlY29yZHNAZ21haWwuY29tIiwibmFtZWlkIjoibXltZWRpcmVjb3Jkc0BnbWFpbC5jb20iLCJlbWFpbCI6Im15bWVkaXJlY29yZHNAZ21haWwuY29tIiwiYXV0aF90aW1lIjoiMDYvMjkvMjAyNCAxMDoxMToyMiIsImRiX25hbWUiOiJtdC1wcm9kLVRlbmFudHMiLCJ0ZW5hbnRfaWQiOiIzMjA3NDIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBRE1JTklTVFJBVE9SIiwiZXhwIjoyNTM0MDIzMDA4MDAsImlzcyI6IkNsYXJlX0FJIiwiYXVkIjoiQ2xhcmVfQUkifQ.Nw-6g96C67FmE0qw0Up6f2Bl4W-x_WsEusImImV_7IU"

@app.route('/', methods=['POST'])
def webhook():
    data = request.json
    logging.info(f"Incoming message: {data}")

    response_data = {'status': 'success', 'file_name': None}

    if data.get('type') == 'document':
        phone_number = data.get('waId')
        print(phone_number)
        document_url = data.get('data')
        
        try:
            # Extract the file name from the document URL
            file_name = document_url.split('/')[-1]
            response_data['file_name'] = file_name

            # Construct the media URL with the correct format
            media_url = f"https://live-mt-server.wati.io/320742/api/v1/getMedia?fileName=data/documents/{file_name}"
            logging.info(f"Attempting to retrieve media file from URL: {media_url}")

            # Download the file using the media URL
            media_response = requests.get(media_url, headers={"Authorization": f"{WATI_API_TOKEN}"})
            logging.info(f"Media response status code: {media_response.status_code}")

            if media_response.status_code == 200:
                # Save the file
                with open(file_name, 'wb') as file:
                    file.write(media_response.content)
                logging.info(f"File {file_name} downloaded successfully")
            else:
                logging.error(f"Failed to retrieve media file: {media_response.status_code}, {media_response.text}")
        except Exception as e:
            logging.error(f"Exception occurred while handling the document: {str(e)}")

    return jsonify(response_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
