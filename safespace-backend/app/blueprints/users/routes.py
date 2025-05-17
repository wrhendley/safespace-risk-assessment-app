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
@users_bp.route('/', methods=['POST'])
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
    db.session.add(new_user)
    db.session.commit()
    
    return user_schema.jsonify(new_user), 201

# Get Current User 
@users_bp.route('/me', methods=['GET'])
@auth_required
def get_current_user():
    account = g.account
    query = select(User).where(User.account_id == account.id)
    user = db.session.execute(query).scalars().first()

    if user is None:
        return jsonify({"message": "user not found"}), 404

    return user_schema.jsonify(user), 200

# Get User by ID, auth required
@users_bp.route('/', methods=['GET'], strict_slashes=False)
@auth_required # applying token verification wrapper to route
def get_user():
    account = g.account
    query = select(User).where(User.account_id == account.id)
    user = db.session.execute(query).scalars().first()

    if user == None:
        print("User not found - returning 404")
        return jsonify({"message": "user not found"}), 404
    
    return user_schema.jsonify(user), 200

# Update User by ID, auth required
@users_bp.route('/<int:user_id>', methods=['PUT'])
@auth_required # applying token verification wrapper to route
def update_user(user_id):
    account = g.account
    query = select(User).where(User.account_id == account.id, User.id == user_id)
    user = db.session.execute(query).scalars().first()
    
    if user == None:
        return jsonify({"message": "user not found"}), 404

    try: 
        user_data = user_create_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400
    
    for field, value in user_data.items():
        setattr(user, field, value)

    db.session.commit()
    return user_schema.jsonify(user), 200

# Update current User, auth required
@users_bp.route('/me', methods=['PUT'])
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

    db.session.commit()
    return user_schema.jsonify(user), 200

# Delete current User, auth required
@users_bp.route('/me', methods=['DELETE'])
@auth_required # applying token verification wrapper to route
def delete_current_user():
    account = g.account
    query = select(User).where(User.account_id == account.id)
    user = db.session.execute(query).scalars().first()
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"succesfully deleted user {user.id}"}), 200

# Delete User by ID, auth required
@users_bp.route('/<int:user_id>', methods=['DELETE'])
@auth_required # applying token verification wrapper to route
def delete_user(user_id):
    account = g.account
    query = select(User).where(User.account_id == account.id, User.id == user_id)
    user = db.session.execute(query).scalars().first()
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"succesfully deleted user {user.id}"}), 200


# Admin Routes (RBAC)

# Create New Admin
# Update Own Admin
# Update User by ID
# Get All Users
# Get User by ID
