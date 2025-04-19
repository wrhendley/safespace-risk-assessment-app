from functools import wraps
from flask import request, jsonify
from firebase_admin import credentials
import pyrebase
import os

firebaseConfig = os.getenv('FIREBASE_CONFIG')
if firebaseConfig is None:
    raise ValueError("FIREBASE_CONFIG environment variable not set")

cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIAL_PATH"))

firebase = pyrebase.initialize_app(firebaseConfig)
auth = firebase.auth()

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        pass
    return decorated