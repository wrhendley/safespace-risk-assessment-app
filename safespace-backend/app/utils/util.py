from functools import wraps
from flask import request, jsonify, g
from firebase_admin import auth
from app.models import Account, db

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            try:
                token = request.headers.get('Authorization').split('Bearer ')[1]
            except IndexError:
                return jsonify({'message': 'Invalid Authorization header format'}), 401
            
        else:
            return jsonify({'message': 'Missing token'}), 401

        try:
            decoded_token = auth.verify_id_token(token)
            firebase_uid = decoded_token['user_id']
            
            account = Account.query.filter_by(firebase_uid=firebase_uid).first()
            if not account:
                return jsonify({'message': 'Account not found'}), 404
            
            g.account = account
            
        except auth.InvalidIdTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        except auth.ExpiredIdTokenError:
            return jsonify({'message': 'Token expired'}), 401
        except Exception as e:
            return jsonify({'message': f'Authentication error: {str(e)}'}), 401

        return f(*args, **kwargs)
    return decorated