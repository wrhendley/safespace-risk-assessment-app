from flask import request, jsonify
from app.utils.util import auth_required
from app.blueprints.accounts import accounts_bp
from app.blueprints.accounts.schemas import account_schema, accounts_schema, account_login_schema
from app.extensions import limiter
from marshmallow import ValidationError
from app.models import Account, db
from sqlalchemy import select

DEFAULT_PAGE = 1
DEFAULT_PER_PAGE = 10
MAX_PER_PAGE = 100

@accounts_bp.route('/', methods=['POST'])
@limiter.limit("5 per minute")
def create_account():
    try:
        account_data = account_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400
    
    new_account = Account(**account_data)
    db.session.add(new_account)
    db.session.commit()
    
    return account_schema.jsonify(new_account), 201

@accounts_bp.route('/', methods=['GET'])
@limiter.limit("5 per minute")
def get_accounts():
    try:
        page = request.args.get('page', DEFAULT_PAGE, type=int)
        per_page = min(request.args.get('per_page', DEFAULT_PER_PAGE, type=int), MAX_PER_PAGE)
        print(f"Page: {page}, Per Page: {per_page}")
        if page < 1 or per_page < 1:
            return jsonify({"message": "Invalid page or per_page parameter"}), 400
        query = select(Account).order_by(Account.created_at.desc())
        accounts = db.paginate(query, page=page, per_page=per_page).items
        if not accounts:
            return jsonify({"message": "No accounts found"}), 404
        return accounts_schema.jsonify(accounts)
    except:
        return jsonify({'message': 'There was an error'}), 400
    
@accounts_bp.route('/me', methods=['GET'])
@auth_required
def get_account(firebase_uid):
    try:
        account = Account.query.filter_by(firebase_uid=request.user['uid']).first()
        if not account:
            return jsonify({"message": "Account not found"}), 404
        return account_schema.jsonify(account)
    except:
        return jsonify({'message': 'There was an error'}), 400
    
@accounts_bp.route('/', methods=['PUT'])
@auth_required
def update_account(firebase_uid):
    try:
        account_data = account_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400
    
    try:
        account = Account.query.filter_by(firebase_uid=request.user['uid']).first()
        if not account:
            return jsonify({"message": "Account not found"}), 404
        
        for field, value in account_data.items():
            setattr(account, field, value)
        
        db.session.commit()
        
        return account_schema.jsonify(account)
    except:
        return jsonify({'message': 'There was an error'}), 400
    
@accounts_bp.route('/', methods=['DELETE'])
@auth_required
def delete_account(firebase_uid):
    try:
        account = Account.query.filter_by(firebase_uid=request.user['uid']).first()
        if not account:
            return jsonify({"message": "Account not found"}), 404
        
        db.session.delete(account)
        db.session.commit()
        
        return jsonify({"message": "Account deleted successfully"}), 200
    except:
        return jsonify({'message': 'There was an error'}), 400