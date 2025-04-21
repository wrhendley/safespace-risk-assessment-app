from flask import Flask
from flask_migrate import Migrate
from app.models import db
from app.extensions import ma, limiter, cache

migrate = Migrate()

def create_app(config_name = 'DevelopmentConfig'):
    app = Flask(__name__)
    app.config.from_object(f'config.{config_name}')
    
    # Add extensions to app
    db.init_app(app)
    ma.init_app(app)
    limiter.init_app(app)
    cache.init_app(app)
    migrate.init_app(app, db)
    
    # Register blueprints
    
    
    return app