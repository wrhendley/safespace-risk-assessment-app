from flask import Flask
from app.models import db
from app.extensions import ma, limiter, cache

def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(f'config.{config_name}')
    
    # Add extensions to app
    db.init_app(app)
    ma.init_app(app)
    limiter.init_app(app)
    cache.init_app(app)
    
    # Register blueprints
    
    
    return app