from functools import wraps
from flask import request, jsonify
from firebase_admin import auth, credentials
from config import Env
import firebase_admin

firebaseConfig = Env.FIREBASE_CONFIG
cred = credentials.Certificate(Env.FIREBASE_CREDENTIAL_PATH)

firebase = firebase_admin.initialize_app(cred)
auth = firebase.auth()

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            token = request.headers.get('Authorization').split()[1]
            
            if not token:
                return jsonify({'message': 'Missing token'}), 401

            try:
                decoded_token = auth.verify_id_token(token)
                request.user = decoded_token
            except firebase_admin.auth.InvalidIdTokenError:
                return jsonify({'message': 'Invalid token'}), 401
            except firebase_admin.auth.ExpiredIdTokenError:
                return jsonify({'message': 'Token expired'}), 401

            return f(*args, **kwargs)
    return decorated