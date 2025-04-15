from app import create_app
from app.models import db
from dotenv import load_dotenv
load_dotenv()

app = create_app('DevelopmentConfig')

with app.app_context():
    db.create_all()
    