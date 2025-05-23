from flask import Flask
from app.models import db
from app.extensions import ma, limiter, cache, migrate, cors
from app.blueprints.accounts import accounts_bp
from app.blueprints.users import users_bp
from app.blueprints.admins import admins_bp
from app.blueprints.simulations import simulations_bp
from config import Env
from firebase_admin import credentials, initialize_app, _apps as firebase_admin_apps
import os

def create_app(config_name = 'DevelopmentConfig'):
    app = Flask(__name__)
    app.config.from_object(f'config.{config_name}')
    
    # Firebase setup
    if(config_name != 'TestingConfig'):
        if not firebase_admin_apps:        
            if not os.path.exists(Env.FIREBASE_CREDENTIAL_PATH):
                raise FileNotFoundError(f"Firebase credentials file not found at {Env.FIREBASE_CREDENTIAL_PATH}")
            
            try:
                cred = credentials.Certificate(Env.FIREBASE_CREDENTIAL_PATH)
                firebase_app = initialize_app(cred)
            except ValueError as e:
                raise ValueError(f"Invalid Firebase credentials file: {e}")
    
    # Add extensions to app
    db.init_app(app)
    cors.init_app(app, supports_credentials=True, origins=app.config.get('CORS_ORIGINS'))
    ma.init_app(app)
    limiter.init_app(app)
    cache.init_app(app)
    migrate.init_app(app, db)
    
    # Register blueprints
    app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(admins_bp, url_prefix='/api/admin/users')
    app.register_blueprint(simulations_bp, url_prefix='/api/simulations')
    
    return app
