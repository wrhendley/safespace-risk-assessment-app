from flask import Blueprint, request, jsonify, g
from app.blueprints.simulations import simulations_bp
from app.blueprints.simulations.schemas import loan_schema, investment_schema
from app.utils.util import auth_required
from app.models import User, db
from marshmallow import ValidationError
from sqlalchemy import select
from datetime import datetime

@simulations_bp.route("/investments", methods=["POST"], strict_slashes=False)
@auth_required
def save_portfolio_simulation():
    data = request.get_json()
    
    account = g.account
    user = db.session.execute(
        select(User).where(User.account_id == account.id)
    ).scalar_one_or_none()
    
    print("start_date", data["start_date"])
    print("end_date", data["end_date"])
    data["user_id"] = user.id
    
    print (g.account.id)
    print("Received data:", data)
    for field in investment_schema.fields:
        print(field, data.get(field))
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        validated_data = investment_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 400
    return jsonify(data), 200