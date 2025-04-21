import os
from app import create_app
from app.models import db
from dotenv import load_dotenv
load_dotenv()

env = os.getenv('FLASK_ENV')

app = create_app(env)

with app.app_context():
    db.create_all()
    