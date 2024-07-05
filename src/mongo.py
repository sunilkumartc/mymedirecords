import logging
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from urllib.parse import quote_plus

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

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    logger.info("Pinged your deployment. Successfully connected to MongoDB!")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")

# Example usage
phone_number = "7411087409"
user_id = get_user_id_by_phone(phone_number)
if user_id:
    logger.info(f"User ID for phone number {phone_number} is {user_id}")
else:
    logger.info(f"No user found with phone number {phone_number}")
