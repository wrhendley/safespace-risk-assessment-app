import os
# from dotenv import load_dotenv
# load_dotenv()

SQLALCHEMY_TRACK_MODIFICATIONS = False

class Env:
    FLASK_ENV = os.getenv('FLASK_ENV', 'ProductionConfig')
    FIREBASE_CREDENTIAL_PATH = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', '/home/ec2-user/myapp/secrets/firebase_credentials.json')
    
class DevelopmentConfig:
    POSTGRES_USER = os.getenv('POSTGRES_USER', 'postgres')
    POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'postgres')
    POSTGRES_DB = os.getenv('POSTGRES_DB', 'safespace')
    POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
    POSTGRES_PORT = os.getenv('POSTGRES_PORT', 5432)
    POSTGRES_URI = (
        f'postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}'
        )
    
    SQLALCHEMY_DATABASE_URI = POSTGRES_URI
    DEBUG = True
    CACHE_TYPE = 'SimpleCache'
    CORS_ORIGINS = ["http://localhost:5173"]
    
class TestingConfig:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'  # Use an in-memory SQLite database for testing
    DEBUG = True
    CACHE_TYPE = 'SimpleCache'
    CORS_ORIGINS = ["http://localhost:5173"]

class ProductionConfig:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    print(f"Using DATABASE_URL: {SQLALCHEMY_DATABASE_URI}")
    CACHE_TYPE = 'SimpleCache'
    CORS_ORIGINS = ["https://ec2-3-133-140-182.us-east-2.compute.amazonaws.com",
                    "https://safespace-streamlit-app-cc827f30d6b6.herokuapp.com",
                    "https://develop.d28k1afihrvt34.amplifyapp.com",
                    "https://main.d28k1afihrvt34.amplifyapp.com",
                    "https://safespacefinancial.duckdns.org"]