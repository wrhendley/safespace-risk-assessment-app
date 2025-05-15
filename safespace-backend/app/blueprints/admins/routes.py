from flask import request, jsonify, g
from app.utils.util import admin_required
from app.blueprints.admins import admins_bp
from app.blueprints.admins.schemas import admin_schema, admin_create_schema
from app.extensions import limiter
from marshmallow import ValidationError
from app.models import User, db
from sqlalchemy import select

DEFAULT_PAGE = 1
DEFAULT_PER_PAGE = 10
MAX_PER_PAGE = 100


# Admin Routes (RBAC)

# Create Admin User
@admins_bp.route('/', methods=['POST'])
@admin_required # applying token verification wrapper to route
@limiter.limit("5 per minute")
def create_admin():
    try:
        account = g.account
        admin_data = admin_create_schema.load(request.json)
        admin_data["account_id"] = account.id
    except ValidationError as e:
        return jsonify(e.messages), 400
    
    new_admin = User(**admin_data)
    db.session.add(new_admin)
    db.session.commit()
    
    return admin_schema.jsonify(new_admin), 201

# Get All Users

# # Get User by ID, auth required
@admins_bp.route('/<int:user_id>', methods=['GET'])
@admin_required # applying token verification wrapper to route
def get_user(user_id):
    account = g.account
    query = select(User).where(User.account_id == account.id, User.id == user_id)
    user = db.session.execute(query).scalars().first()

    if user == None:
        print("User not found - returning 404")
        return jsonify({"message": "user not found"}), 404
    
    return user_schema.jsonify(user), 200

# # Update User by ID, auth required
# @admins_bp.route('/<int:user_id>', methods=['PUT'])
# @auth_required # applying token verification wrapper to route
# def update_user(user_id):
#     account = g.account
#     query = select(User).where(User.account_id == account.id, User.id == user_id)
#     user = db.session.execute(query).scalars().first()
    
#     if user == None:
#         return jsonify({"message": "user not found"}), 404

#     try: 
#         user_data = user_create_schema.load(request.json)
#     except ValidationError as e:
#         return jsonify(e.messages), 400
    
#     for field, value in user_data.items():
#         setattr(user, field, value)

#     db.session.commit()
#     return user_schema.jsonify(user), 200

# # Delete User by ID, auth required
# @admins_bp.route('/<int:user_id>', methods=['DELETE'])
# @auth_required # applying token verification wrapper to route
# def delete_user(user_id):
#     account = g.account
#     query = select(User).where(User.account_id == account.id, User.id == user_id)
#     user = db.session.execute(query).scalars().first()
#     db.session.delete(user)
#     db.session.commit()
#     return jsonify({"message": f"succesfully deleted user {user.id}"}), 200