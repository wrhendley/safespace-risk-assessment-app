from flask import request, jsonify
from app.utils.util import auth_required
from app.blueprints.accounts import accounts_bp
from app.blueprints.accounts.schemas import account_schema
from app.extensions import limiter
from marshmallow import ValidationError
from app.models import Account, db

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