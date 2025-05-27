from app import create_app
from app.models import db
from config import Env

env = Env.FLASK_ENV
if not env:
    raise RuntimeError("FLASK_ENV environment variable is not set.")

print(f"Starting app with config: {env}")

app = create_app(env)

with app.app_context():
    db.create_all()
    