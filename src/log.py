import logging.config

# create a logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(f"logs/app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
