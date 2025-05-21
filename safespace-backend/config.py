import os
from dotenv import load_dotenv
load_dotenv()

SQLALCHEMY_TRACK_MODIFICATIONS = False

class Env:
    POSTGRES_USER = os.getenv('POSTGRES_USER')
    POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')
    POSTGRES_DB = os.getenv('POSTGRES_DB')
    POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
    POSTGRES_PORT = os.getenv('POSTGRES_PORT', 5432)
    POSTGRES_URI = (
        f'postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}'
        )
    
    FLASK_ENV = os.getenv('FLASK_ENV')
    
    FIREBASE_CREDENTIAL_PATH = os.getenv('GOOGLE_APPLICATION_CREDENTIALS').strip('"')
    FIREBASE_CONFIG = os.getenv('FIREBASE_CONFIG')
    
class DevelopmentConfig:
    SQLALCHEMY_DATABASE_URI = Env.POSTGRES_URI
    DEBUG = True
    CACHE_TYPE = 'SimpleCache'
    CORS_ORIGINS = ["http://localhost:5173"]
    
class TestingConfig:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'  # Use an in-memory SQLite database for testing
    DEBUG = True
    CACHE_TYPE = 'SimpleCache'
    CORS_ORIGINS = ["http://localhost:5173"]

class ProductionConfig:
    SQLALCHEMY_DATABASE_URI = os.environ.get('')
    CACHE_TYPE = 'SimpleCache'
    CORS_ORIGINS = ["https://codingtemple.slack.com/archives/C08L80TUZB6/p1747865873121049", "https://codingtemple.slack.com/archives/C08L80TUZB6/p1747863304180429"]