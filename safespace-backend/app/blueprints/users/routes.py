from flask import request, jsonify, g
from app.utils.util import auth_required
from app.blueprints.users import users_bp
from app.blueprints.users.schemas import user_schema, user_create_schema
from app.extensions import limiter
from marshmallow import ValidationError
from app.models import User, db
from sqlalchemy import select

DEFAULT_PAGE = 1
DEFAULT_PER_PAGE = 10
MAX_PER_PAGE = 100


# User Routes

# Create User
@users_bp.route('/', methods=['POST'], strict_slashes=False)
@auth_required # applying token verification wrapper to route
@limiter.limit("5 per minute")
def create_user():
    try:
        account = g.account
        user_data = user_create_schema.load(request.json)
        user_data["account_id"] = account.id
    except ValidationError as e:
        return jsonify(e.messages), 400
    
    new_user = User(**user_data)
    
    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'There was an error: {str(e)}'}), 400
    return user_schema.jsonify(new_user), 201

# Get Current User 
@users_bp.route('/me', methods=['GET'], strict_slashes=False)
@auth_required
def get_current_user():
    account = g.account
    query = select(User).where(User.account_id == account.id)
    user = db.session.execute(query).scalars().first()

    if user is None:
        return jsonify({"message": "user not found"}), 404

    return user_schema.jsonify(user), 200

# Update current User, auth required
@users_bp.route('/me', methods=['PUT'], strict_slashes=False)
@auth_required # applying token verification wrapper to route
def update_current_user():
    account = g.account
    query = select(User).where(User.account_id == account.id)
    user = db.session.execute(query).scalars().first()
    
    if user == None:
        return jsonify({"message": "user not found"}), 404

    try: 
        user_data = user_create_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400
    
    for field, value in user_data.items():
        setattr(user, field, value)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'There was an error: {str(e)}'}), 400
    
    db.session.refresh(user)
    return user_schema.jsonify(user), 200

# Delete current User, auth required
@users_bp.route('/me', methods=['DELETE'], strict_slashes=False)
@auth_required # applying token verification wrapper to route
def delete_current_user():
    account = g.account
    query = select(User).where(User.account_id == account.id)
    user = db.session.execute(query).scalars().first()
    
    try:
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'There was an error: {str(e)}'}), 400
    
    return jsonify({"message": f"succesfully deleted user {user.id}"}), 200