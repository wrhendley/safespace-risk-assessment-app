from flask import request, jsonify
from app.utils.util import auth_required
from app.blueprints.users import users_bp
from app.blueprints.users.schemas import user_schema
from app.extensions import limiter
from marshmallow import ValidationError
from app.models import User, db
from sqlalchemy import select

DEFAULT_PAGE = 1
DEFAULT_PER_PAGE = 10
MAX_PER_PAGE = 100


# Create User
@users_bp.route('/', methods=['POST'])
@auth_required # applying token verification wrapper to route
@limiter.limit("5 per minute")
def create_user():
    try:
        user_data = user_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400
    
    new_user = User(**user_data)
    db.session.add(new_user)
    db.session.commit()
    
    return user_schema.jsonify(new_user), 201

# Get User by ID, auth required
@users_bp.route('/', methods=['GET'])
@auth_required # applying token verification wrapper to route
def get_user(user_id):
    query = select(User).where(User.id == user_id)
    user = db.session.execute(query).scalars().first()

    if user == None:
        return jsonify({"message": "user not found"}), 404
    
    return user_schema.jsonify(user), 200

# Update User by ID, auth required
@users_bp.route('/', methods=['PUT'])
@auth_required # applying token verification wrapper to route
def update_user(user_id):
    query = select(User).where(User.id == user_id)
    user = db.session.execute(query).scalars().first()
    
    if user == None:
        return jsonify({"message": "user not found"}), 404

    try: 
        user_data = user_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400
    
    for field, value in user_data.items():
        setattr(user, field, value)

    db.session.commit()
    return user_schema.jsonify(user), 200

# Delete User by ID, auth required
@users_bp.route('/', methods=['DELETE'])
@auth_required # applying token verification wrapper to route
def delete_user(user_id):
    user = db.session.get(User, user_id)
    if user == None: 
        return jsonify({"message": "user not found"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"succesfully deleted user {user_id}"}), 200