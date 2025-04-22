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
    
class DevelopmentConfig:
    SQLALCHEMY_DATABASE_URI = Env.POSTGRES_URI
    DEBUG = True
    CACHE_TYPE = 'SimpleCache'
    
class TestingConfig:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///testing.db'
    DEBUG = True
    CACHE_TYPE = 'SimpleCache'

class ProductionConfig:
    SQLALCHEMY_DATABASE_URI = os.environ.get('')
    CACHE_TYPE = 'SimpleCache'