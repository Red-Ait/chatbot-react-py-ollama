from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env

openai_api_key = os.environ["OPENAI_API_KEY"]
db_name = os.environ["DB_NAME"]
db_username = os.environ["DB_USERNAME"]
db_password = os.environ["DB_PASSWORD"]
db_host = os.environ["DB_HOST"]
db_port = os.environ["DB_PORT"]
