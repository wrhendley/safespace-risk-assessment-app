from flask import request, jsonify, g
from app.utils.util import auth_required, admin_required
from app.blueprints.accounts import accounts_bp
from app.blueprints.accounts.schemas import account_schema, accounts_schema, account_login_schema, account_update_schema
from app.extensions import limiter
from marshmallow import ValidationError
from app.models import Account, db
from sqlalchemy import select

DEFAULT_PAGE = 1
DEFAULT_PER_PAGE = 10
MAX_PER_PAGE = 100

@accounts_bp.route('/', methods=['POST'], strict_slashes=False)
@limiter.limit("5 per minute")
def create_account():
    try:
        account_data = account_schema.load(request.json)
        query = select(Account).filter_by(email=account_data['email'])
        existing_account = db.session.execute(query).scalar_one_or_none()
        if existing_account:
            return jsonify({"message": "Account with this email already exists"}), 409
    except ValidationError as e:
        return jsonify(e.messages), 400
    
    new_account = Account(**account_data)
    db.session.add(new_account)
    db.session.commit()
    
    return account_schema.jsonify(new_account), 201

@accounts_bp.route('/', methods=['GET'], strict_slashes=False)
@limiter.limit("5 per minute")
@admin_required
def get_accounts():
    try:
        page = request.args.get('page', DEFAULT_PAGE, type=int)
        per_page = min(request.args.get('per_page', DEFAULT_PER_PAGE, type=int), MAX_PER_PAGE)
        if page < 1 or per_page < 1:
            return jsonify({"message": "Invalid page or per_page parameter"}), 400
        query = select(Account).order_by(Account.created_at.desc())
        accounts = db.paginate(query, page=page, per_page=per_page).items
        if not accounts:
            return jsonify({"message": "No accounts found"}), 404
        return accounts_schema.jsonify(accounts)
    except ValidationError as e:
        return jsonify(e.messages), 400
    except:
        return jsonify({'message': 'There was an error'}), 400
    
@accounts_bp.route('/me', methods=['GET'], strict_slashes=False)
@auth_required
def get_account():
    account = g.account
    return account_schema.jsonify(account)
    
@accounts_bp.route('/update', methods=['PUT'], strict_slashes=False)
@auth_required
def update_account():
    account = g.account
    
    if not account:
        return jsonify({"message": "Account not found"}), 404
    
    try:
        account_data = account_update_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400
    
    try:
        for field, value in account_data.items():
            setattr(account, field, value)
        
        db.session.commit()
        
        return account_schema.jsonify(account)
    
    except Exception as e:
        return jsonify({'message': f'There was an error: {str(e)}'}), 400
    
@accounts_bp.route('/', methods=['DELETE'], strict_slashes=False)
@auth_required
def delete_account():
    try:
        account = g.account
        if not account:
            return jsonify({"message": "Account not found"}), 404
        
        db.session.delete(account)
        db.session.commit()
        
        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        return jsonify({'message': f'There was an error: {str(e)}'}), 400