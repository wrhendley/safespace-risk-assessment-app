from flask import Flask
from app.models import db
from app.extensions import ma, limiter, cache, migrate
from app.blueprints.accounts import accounts_bp

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
    app.register_blueprint(accounts_bp, url_prefix='/accounts')
    
    return app